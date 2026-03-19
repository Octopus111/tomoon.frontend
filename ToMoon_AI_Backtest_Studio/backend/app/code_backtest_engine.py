from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd


def _to_unix_seconds(ts: str) -> int:
    try:
        return int(datetime.fromisoformat(str(ts).replace("Z", "+00:00")).timestamp())
    except Exception:
        return int(datetime.utcnow().timestamp())


def _safe_exec_strategy(strategy_code: str):
    safe_builtins = {
        "__import__": __import__,
        "abs": abs,
        "min": min,
        "max": max,
        "sum": sum,
        "len": len,
        "range": range,
        "float": float,
        "int": int,
        "bool": bool,
        "enumerate": enumerate,
    }
    env: Dict[str, Any] = {"__builtins__": safe_builtins, "pd": pd, "np": np}
    exec(strategy_code, env, env)
    build_signals = env.get("build_signals")
    build_trade_plan = env.get("build_trade_plan")
    if not callable(build_signals):
        raise RuntimeError("strategy_code must define callable build_signals(df, params)")
    if not callable(build_trade_plan):
        raise RuntimeError("strategy_code must define callable build_trade_plan(params)")
    return build_signals, build_trade_plan


def _calc_position_size(
    equity: float,
    entry_price: float,
    sl_pct: float,
    risk_pct: float,
    spread_pct: float,
    slippage_pct: float,
) -> int:
    risk_dollar = max(0.0, equity * max(0.0, risk_pct))
    stop_dist = max(1e-12, entry_price * max(0.0, sl_pct))
    cost_buffer = entry_price * max(0.0, spread_pct + slippage_pct)
    effective_dist = max(1e-12, stop_dist + cost_buffer)
    qty = int(risk_dollar / effective_dist)
    return max(1, qty)


def run_code_backtest(
    bars: List[Dict[str, Any]],
    strategy_code: str,
    params: Dict[str, Any],
    initial_capital: float,
    commission: float,
    spread_pct: float,
    slippage_pct: float,
) -> Dict[str, Any]:
    if len(bars) < 50:
        raise RuntimeError(f"Insufficient bars: {len(bars)}")

    df = pd.DataFrame(bars).copy()
    for col in ("open", "high", "low", "close", "volume"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["open", "high", "low", "close"]).reset_index(drop=True)

    build_signals, build_trade_plan = _safe_exec_strategy(strategy_code)
    signal_map = build_signals(df.copy(), params or {})
    trade_plan = build_trade_plan(params or {})

    n = len(df)

    def _signal_list(name: str) -> List[bool]:
        raw = signal_map.get(name, [False] * n)
        if len(raw) != n:
            raise RuntimeError(f"Signal '{name}' length mismatch: {len(raw)} != {n}")
        return [bool(x) for x in raw]

    long_entry = _signal_list("long_entry")
    short_entry = _signal_list("short_entry")
    long_exit = _signal_list("long_exit")
    short_exit = _signal_list("short_exit")

    sl_pct = float(trade_plan.get("sl_pct", 0.005))
    tp_levels = [float(x) for x in trade_plan.get("tp_levels", [0.01, 0.015, 0.02])]
    tp_qty = [float(x) for x in trade_plan.get("tp_qty", [0.5, 0.3, 0.2])]
    risk_pct = float(trade_plan.get("risk_pct", 0.01))
    stage_effect = str(trade_plan.get("stage_effect", "NEXT_BAR")).upper()
    conflict_policy = str(trade_plan.get("conflict_policy", "SL_FIRST")).upper()
    ratchet_to = str(trade_plan.get("ratchet_to", "TP1")).upper()
    use_next_open = bool(trade_plan.get("entry_next_open", True))

    cash = float(initial_capital)
    peak = cash
    max_dd = 0.0
    equity_curve: List[Dict[str, Any]] = []
    fills: List[Dict[str, Any]] = []

    pos: Optional[Dict[str, Any]] = None
    pending_sl: Optional[float] = None

    for i in range(1, n):
        row = df.iloc[i]
        prev_row = df.iloc[i - 1]

        if pos is not None and pending_sl is not None:
            if stage_effect == "NEXT_BAR":
                if pos["side"] == "LONG":
                    pos["sl"] = max(pos["sl"], pending_sl)
                else:
                    pos["sl"] = min(pos["sl"], pending_sl)
                pending_sl = None

        if pos is None:
            side = None
            if long_entry[i - 1]:
                side = "LONG"
            elif short_entry[i - 1]:
                side = "SHORT"

            if side is not None:
                entry_price = float(row["open"] if use_next_open else prev_row["close"])
                if side == "LONG":
                    entry_price *= (1.0 + spread_pct + slippage_pct)
                    sl0 = entry_price * (1.0 - sl_pct)
                    tp_price = [entry_price * (1.0 + p) for p in tp_levels]
                else:
                    entry_price *= (1.0 - spread_pct - slippage_pct)
                    sl0 = entry_price * (1.0 + sl_pct)
                    tp_price = [entry_price * (1.0 - p) for p in tp_levels]

                equity_now = cash
                qty = _calc_position_size(equity_now, entry_price, sl_pct, risk_pct, spread_pct, slippage_pct)
                fee = qty * (commission / 2.0)
                cash -= fee

                pos = {
                    "side": side,
                    "entry_price": entry_price,
                    "entry_time": row["timestamp"],
                    "qty0": qty,
                    "qty_left": float(qty),
                    "sl": sl0,
                    "tp_price": tp_price,
                    "tp_hit": [False] * len(tp_price),
                }

                fills.append(
                    {
                        "direction": side,
                        "kind": "ENTRY",
                        "qty": qty,
                        "price": entry_price,
                        "time": row["timestamp"],
                        "netPnl": 0.0,
                    }
                )

        if pos is not None:
            high = float(row["high"])
            low = float(row["low"])
            close = float(row["close"])
            side = pos["side"]

            sl_hit = low <= pos["sl"] if side == "LONG" else high >= pos["sl"]

            tp_hits: List[int] = []
            for idx, tp in enumerate(pos["tp_price"]):
                if pos["tp_hit"][idx]:
                    continue
                if side == "LONG" and high >= tp:
                    tp_hits.append(idx)
                if side == "SHORT" and low <= tp:
                    tp_hits.append(idx)

            if conflict_policy == "SL_FIRST" and sl_hit:
                tp_hits = []

            for idx in tp_hits:
                if pos["qty_left"] <= 0:
                    break
                tranche = pos["qty0"] * tp_qty[min(idx, len(tp_qty) - 1)]
                close_qty = float(min(pos["qty_left"], max(0.0, tranche)))
                if close_qty <= 0:
                    continue
                exit_price = pos["tp_price"][idx]
                pos["tp_hit"][idx] = True
                pos["qty_left"] -= close_qty

                gross = (exit_price - pos["entry_price"]) * close_qty if side == "LONG" else (pos["entry_price"] - exit_price) * close_qty
                fee = close_qty * (commission / 2.0)
                net = gross - fee
                cash += net

                fills.append(
                    {
                        "direction": side,
                        "kind": f"TP{idx + 1}",
                        "qty": close_qty,
                        "price": exit_price,
                        "time": row["timestamp"],
                        "netPnl": float(net),
                    }
                )

                be_buffer = pos["entry_price"] * (spread_pct + slippage_pct)
                if idx == 0:
                    new_sl = pos["entry_price"] + be_buffer if side == "LONG" else pos["entry_price"] - be_buffer
                    pending_sl = new_sl if pending_sl is None else (max(pending_sl, new_sl) if side == "LONG" else min(pending_sl, new_sl))
                if idx == 1:
                    ref_idx = 1 if ratchet_to == "TP2" else 0
                    ref_price = pos["tp_price"][ref_idx]
                    pending_sl = ref_price if pending_sl is None else (max(pending_sl, ref_price) if side == "LONG" else min(pending_sl, ref_price))

            if pos["qty_left"] > 0 and sl_hit:
                exit_price = pos["sl"]
                close_qty = float(pos["qty_left"])
                pos["qty_left"] = 0.0

                gross = (exit_price - pos["entry_price"]) * close_qty if side == "LONG" else (pos["entry_price"] - exit_price) * close_qty
                fee = close_qty * (commission / 2.0)
                net = gross - fee
                cash += net

                fills.append(
                    {
                        "direction": side,
                        "kind": "SL",
                        "qty": close_qty,
                        "price": exit_price,
                        "time": row["timestamp"],
                        "netPnl": float(net),
                    }
                )

            if pos["qty_left"] > 0:
                signal_exit = long_exit[i] if side == "LONG" else short_exit[i]
                if signal_exit:
                    close_qty = float(pos["qty_left"])
                    pos["qty_left"] = 0.0
                    exit_price = close
                    gross = (exit_price - pos["entry_price"]) * close_qty if side == "LONG" else (pos["entry_price"] - exit_price) * close_qty
                    fee = close_qty * (commission / 2.0)
                    net = gross - fee
                    cash += net
                    fills.append(
                        {
                            "direction": side,
                            "kind": "SIGNAL_EXIT",
                            "qty": close_qty,
                            "price": exit_price,
                            "time": row["timestamp"],
                            "netPnl": float(net),
                        }
                    )

            if pos["qty_left"] <= 1e-9:
                pos = None
                pending_sl = None

        unrealized = 0.0
        if pos is not None:
            mark = float(row["close"])
            if pos["side"] == "LONG":
                unrealized = (mark - pos["entry_price"]) * pos["qty_left"]
            else:
                unrealized = (pos["entry_price"] - mark) * pos["qty_left"]

        equity = cash + unrealized
        peak = max(peak, equity)
        max_dd = max(max_dd, (peak - equity) / peak if peak > 0 else 0.0)
        equity_curve.append({"time": _to_unix_seconds(str(row["timestamp"])), "equity": float(equity)})

    net_profit = cash - float(initial_capital)
    closed_fills = [f for f in fills if f["kind"] != "ENTRY"]
    wins = sum(1 for f in closed_fills if float(f.get("netPnl", 0.0)) > 0)
    win_rate = (wins / len(closed_fills)) if closed_fills else 0.0

    return {
        "metrics": {
            "net_profit": float(net_profit),
            "win_rate": float(win_rate),
            "max_drawdown": float(max_dd),
            "max_drawdown_pct": float(max_dd),
            "total_trades": int(len(closed_fills)),
        },
        "trades": fills,
        "equity_curve": equity_curve,
        "chart_data": {
            "bars": bars,
            "markers": [],
            "start_idx": 0,
            "end_idx": max(0, len(bars) - 1),
        },
    }
