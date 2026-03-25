from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional


def calc_sma(values: List[float], period: int) -> List[float]:
    out = [float("nan")] * len(values)
    if period <= 0:
        return out
    acc = 0.0
    for i, v in enumerate(values):
        acc += v
        if i >= period:
            acc -= values[i - period]
        if i >= period - 1:
            out[i] = acc / period
    return out


def calc_ema(values: List[float], period: int) -> List[float]:
    out = [float("nan")] * len(values)
    if not values or period <= 0:
        return out
    alpha = 2.0 / (period + 1)
    ema = values[0]
    out[0] = ema
    for i in range(1, len(values)):
        ema = alpha * values[i] + (1.0 - alpha) * ema
        out[i] = ema
    return out


def calc_rsi(values: List[float], period: int) -> List[float]:
    out = [float("nan")] * len(values)
    if len(values) <= period or period <= 0:
        return out
    gains = 0.0
    losses = 0.0
    for i in range(1, period + 1):
        d = values[i] - values[i - 1]
        gains += max(d, 0.0)
        losses += max(-d, 0.0)
    avg_gain = gains / period
    avg_loss = losses / period
    out[period] = 100.0 if avg_loss == 0 else 100.0 - (100.0 / (1.0 + avg_gain / avg_loss))
    for i in range(period + 1, len(values)):
        d = values[i] - values[i - 1]
        gain = max(d, 0.0)
        loss = max(-d, 0.0)
        avg_gain = ((avg_gain * (period - 1)) + gain) / period
        avg_loss = ((avg_loss * (period - 1)) + loss) / period
        out[i] = 100.0 if avg_loss == 0 else 100.0 - (100.0 / (1.0 + avg_gain / avg_loss))
    return out


def indicator_key(side: Dict[str, Any]) -> Optional[str]:
    t = str(side.get("type") or "").lower()
    p = side.get("period")
    if t in {"sma", "ema", "rsi"} and isinstance(p, int):
        return f"{t}{p}"
    return None


def build_indicator_map(conditions: List[Dict[str, Any]], closes: List[float]) -> Dict[str, List[float]]:
    out: Dict[str, List[float]] = {}
    for c in conditions:
        for side in [c.get("left", {}), c.get("right", {})]:
            if not isinstance(side, dict):
                continue
            k = indicator_key(side)
            if not k or k in out:
                continue
            t = str(side.get("type")).lower()
            p = int(side.get("period"))
            if t == "sma":
                out[k] = calc_sma(closes, p)
            elif t == "ema":
                out[k] = calc_ema(closes, p)
            elif t == "rsi":
                out[k] = calc_rsi(closes, p)
    return out


def cond_value(side: Dict[str, Any], i: int, closes: List[float], imap: Dict[str, List[float]]) -> Optional[float]:
    if side.get("value") is not None:
        return float(side["value"])
    t = str(side.get("type") or "").lower()
    if t == "price":
        return closes[i]
    k = indicator_key(side)
    if not k or k not in imap:
        return None
    if i < 0 or i >= len(imap[k]):
        return None
    v = imap[k][i]
    return None if v != v else float(v)


def eval_condition(cond: Dict[str, Any], i: int, closes: List[float], imap: Dict[str, List[float]]) -> bool:
    op = str(cond.get("op") or "")
    left = cond.get("left", {}) if isinstance(cond.get("left"), dict) else {}
    right = cond.get("right", {}) if isinstance(cond.get("right"), dict) else {}

    lc = cond_value(left, i, closes, imap)
    if lc is None:
        return False

    if op in {"gt", "lt"}:
        rv = cond_value(right, i, closes, imap)
        if rv is None:
            return False
        return lc > rv if op == "gt" else lc < rv

    if i <= 0:
        return False

    lp = cond_value(left, i - 1, closes, imap)
    rc = cond_value(right, i, closes, imap)
    rp = cond_value(right, i - 1, closes, imap)
    if lp is None or rc is None or rp is None:
        return False

    if op == "crossAbove":
        return lp <= rp and lc > rc
    if op == "crossBelow":
        return lp >= rp and lc < rc
    return False


def to_unix_seconds(ts: str) -> int:
    try:
        return int(datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp())
    except Exception:
        return int(datetime.utcnow().timestamp())


def run_condition_backtest(
    bars: List[Dict[str, Any]],
    entry_logic: str,
    exit_logic: str,
    entry_conditions: List[Dict[str, Any]],
    exit_conditions: List[Dict[str, Any]],
    risk: Dict[str, Any],
    initial_capital: float,
    commission: float,
    slippage_pct: float,
) -> Dict[str, Any]:
    closes = [float(b["close"]) for b in bars]
    all_conditions = entry_conditions + exit_conditions
    imap = build_indicator_map(all_conditions, closes)

    tp_pct = float(risk.get("takeProfitPct", 0.03))
    sl_pct = float(risk.get("stopLossPct", 0.015))
    max_hold = int(risk.get("maxHoldBars", 240))

    cash = float(initial_capital)
    position = None
    trades: List[Dict[str, Any]] = []
    equity_curve: List[Dict[str, Any]] = []
    peak = cash
    max_dd = 0.0

    for i in range(1, len(bars)):
        price = closes[i]

        entry_evals = [eval_condition(c, i, closes, imap) for c in entry_conditions]
        if entry_logic == "OR":
            entry_ok = any(entry_evals) if entry_evals else False
        else:
            entry_ok = all(entry_evals) if entry_evals else False

        exit_evals = [eval_condition(c, i, closes, imap) for c in exit_conditions]
        if exit_logic == "AND":
            exit_ok = all(exit_evals) if exit_evals else False
        else:
            exit_ok = any(exit_evals) if exit_evals else False

        if position is None and entry_ok:
            entry_price = price * (1.0 + slippage_pct)
            qty = max(1, int(cash // max(entry_price, 1e-12)))
            fee = qty * (commission / 2.0)
            cash -= fee
            position = {
                "entryPrice": entry_price,
                "qty": qty,
                "entryBar": i,
                "entryTime": bars[i]["timestamp"],
                "stopLoss": entry_price * (1.0 - sl_pct),
                "takeProfit": entry_price * (1.0 + tp_pct),
            }

        if position is not None:
            hold = i - int(position["entryBar"])
            hit_sl = price <= float(position["stopLoss"])
            hit_tp = price >= float(position["takeProfit"])
            hit_hold = hold >= max_hold
            should_exit = exit_ok or hit_sl or hit_tp or hit_hold

            if should_exit:
                exit_price = price * (1.0 - slippage_pct)
                gross = (exit_price - float(position["entryPrice"])) * float(position["qty"])
                fee = float(position["qty"]) * (commission / 2.0)
                net = gross - fee
                cash += net
                trades.append(
                    {
                        "direction": "LONG",
                        "entryPrice": float(position["entryPrice"]),
                        "exitPrice": float(exit_price),
                        "qty": int(position["qty"]),
                        "netPnl": float(net),
                        "entryTime": position["entryTime"],
                        "exitTime": bars[i]["timestamp"],
                        "holdBars": hold,
                    }
                )
                position = None

        unrealized = 0.0
        if position is not None:
            unrealized = (price - float(position["entryPrice"])) * float(position["qty"])
        equity = cash + unrealized
        peak = max(peak, equity)
        dd = (peak - equity) / peak if peak > 0 else 0.0
        max_dd = max(max_dd, dd)
        equity_curve.append({"time": to_unix_seconds(bars[i]["timestamp"]), "equity": float(equity)})

    wins = sum(1 for t in trades if float(t["netPnl"]) > 0)
    win_rate = (wins / len(trades)) if trades else 0.0

    markers = []
    for t in trades:
        markers.append({"time": t["entryTime"], "kind": "buy", "price": t["entryPrice"]})
        markers.append({"time": t["exitTime"], "kind": "sell", "price": t["exitPrice"]})

    return {
        "metrics": {
            "net_profit": float(cash - initial_capital),
            "win_rate": float(win_rate),
            "max_drawdown": float(max_dd),
            "max_drawdown_pct": float(max_dd),
            "total_trades": len(trades),
        },
        "trades": trades,
        "equity_curve": equity_curve,
        "chart_data": {
            "bars": bars,
            "markers": markers,
            "start_idx": 0,
            "end_idx": max(0, len(bars) - 1),
        },
    }
