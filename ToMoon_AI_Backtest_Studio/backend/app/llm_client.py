from __future__ import annotations

import os
import re
from typing import Tuple

import requests

from .strategy_schema import extract_first_json_object, validate_strategy_payload

DEFAULT_SYSTEM_PROMPT = """
You are a quant strategy JSON generator.
Output JSON only with this schema:
{
  "name": "string",
  "entryConditions": [{"id":"E1","left":{"type":"sma","period":20},"op":"crossAbove","right":{"type":"ema","period":50},"text":"SMA20 crossAbove EMA50"}],
  "exitConditions": [{"id":"X1","left":{"type":"sma","period":20},"op":"crossBelow","right":{"type":"ema","period":50},"text":"SMA20 crossBelow EMA50"}],
  "risk": {"takeProfitPct":0.03,"stopLossPct":0.015,"maxHoldBars":240}
}
Allowed op: crossAbove, crossBelow, gt, lt.
Allowed type: sma, ema, rsi, price.
Percent values must be decimal (3% => 0.03).
""".strip()


def parse_strategy_with_llm(user_input: str, model: str, api_key: str = None, base_url: str = None) -> Tuple[dict, str]:
    base_url = (base_url or os.getenv("LLM_BASE_URL") or "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").rstrip("/")
    api_key = api_key or os.getenv("LLM_API_KEY")
    if not api_key:
        raise RuntimeError("LLM_API_KEY is not set. Please configure API Key in AI Settings.")
    

    system_prompt = os.getenv("LLM_SYSTEM_PROMPT") or DEFAULT_SYSTEM_PROMPT

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Build strategy JSON for: {user_input}"},
        ],
        "stream": False,
    }

    resp = requests.post(
        f"{base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=body,
        timeout=60,
    )
    if resp.status_code >= 400:
        try:
            err_data = resp.json()
            err_msg = err_data.get("error", {}).get("message", resp.text)
        except Exception:
            err_msg = resp.text
        raise RuntimeError(f"LLM request failed: HTTP {resp.status_code} - {err_msg}")

    data = resp.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not content:
        raise RuntimeError("LLM returned empty content")

    payload = extract_first_json_object(content)
    strategy = validate_strategy_payload(payload)
    return strategy.model_dump(), content


def _build_oc_cross_artifacts() -> Tuple[dict, str, list[str]]:
    strategy = {
        "name": "OC Cross Strategy (ALMA C/O)",
        "entryLogic": "OR",
        "exitLogic": "OR",
        "entryConditions": [
            {
                "id": "E1",
                "left": {"type": "sma", "period": 6},
                "op": "crossAbove",
                "right": {"type": "ema", "period": 6},
                "text": "ALMA(Close,6) 上穿 ALMA(Open,6) -> Long",
            },
            {
                "id": "E2",
                "left": {"type": "sma", "period": 6},
                "op": "crossBelow",
                "right": {"type": "ema", "period": 6},
                "text": "ALMA(Close,6) 下穿 ALMA(Open,6) -> Short",
            },
        ],
        "exitConditions": [],
        "risk": {"takeProfitPct": 0.02, "stopLossPct": 0.005, "maxHoldBars": 240},
    }

    code = """
def _alma(series, window=6, offset=0.85, sigma=5):
    s = pd.Series(series).astype(float)
    m = offset * (window - 1)
    w = window / float(sigma)
    idx = np.arange(window)
    weights = np.exp(-((idx - m) ** 2) / (2 * (w ** 2)))
    weights = weights / weights.sum()
    return s.rolling(window).apply(lambda x: float(np.dot(weights, x)), raw=True)


def build_signals(df, params):
    close = df["close"].astype(float)
    open_ = df["open"].astype(float)
    basis_len = int(params.get("basis_len", 6))
    offset = float(params.get("offset_alma", 0.85))
    sigma = float(params.get("sigma_alma", 5))
    delay = int(params.get("delay_offset", 0))

    c_src = close.shift(delay)
    o_src = open_.shift(delay)
    ma_c = _alma(c_src, basis_len, offset, sigma)
    ma_o = _alma(o_src, basis_len, offset, sigma)

    cross_up = (ma_c > ma_o) & (ma_c.shift(1) <= ma_o.shift(1))
    cross_dn = (ma_c < ma_o) & (ma_c.shift(1) >= ma_o.shift(1))

    return {
        "long_entry": cross_up.fillna(False).tolist(),
        "short_entry": cross_dn.fillna(False).tolist(),
        "long_exit": cross_dn.fillna(False).tolist(),
        "short_exit": cross_up.fillna(False).tolist(),
    }


def build_trade_plan(params):
    return {
        "risk_pct": float(params.get("risk_pct", 0.01)),
        "sl_pct": float(params.get("sl_pct", 0.005)),
        "tp_levels": params.get("tp_levels", [0.01, 0.015, 0.02]),
        "tp_qty": params.get("tp_qty", [0.5, 0.3, 0.2]),
        "entry_next_open": True,
        "conflict_policy": params.get("conflict_policy", "SL_FIRST"),
        "stage_effect": params.get("stage_effect", "NEXT_BAR"),
        "ratchet_to": params.get("ratchet_to", "TP1"),
    }
""".strip()

    summary = [
        "已生成 OC Cross 代码策略 (ALMA Close/Open Cross, 15m)",
        "已启用三段止盈 + Stage-based SL Ratchet + 1% 风险仓位",
        "回测执行口径: next bar open, SL_FIRST, NEXT_BAR_STAGE_EFFECTIVE",
    ]
    return strategy, code, summary


def _build_regex_strategy(user_input: str) -> Tuple[dict, str, list[str]]:
    text = user_input or ""
    lower = text.lower()
    sma = re.search(r"sma\s*(\d{1,3})", lower)
    ema = re.search(r"ema\s*(\d{1,3})", lower)
    rsi_lt = re.search(r"rsi\s*(?:低于|<|<=)\s*(\d{1,2})", text, re.IGNORECASE)
    tp = re.search(r"(?:止盈|tp)\s*(\d+(?:\.\d+)?)\s*%", text, re.IGNORECASE)
    sl = re.search(r"(?:止损|sl)\s*(\d+(?:\.\d+)?)\s*%", text, re.IGNORECASE)

    sp = int(sma.group(1)) if sma else 20
    ep = int(ema.group(1)) if ema else 50
    rsi_v = int(rsi_lt.group(1)) if rsi_lt else 30
    tp_v = (float(tp.group(1)) / 100.0) if tp else 0.03
    sl_v = (float(sl.group(1)) / 100.0) if sl else 0.015

    strategy = {
        "name": f"SMA{sp}/EMA{ep} Cross + RSI Filter",
        "entryLogic": "AND",
        "exitLogic": "OR",
        "entryConditions": [
            {
                "id": "E1",
                "left": {"type": "sma", "period": sp},
                "op": "crossAbove",
                "right": {"type": "ema", "period": ep},
                "text": f"SMA{sp} 上穿 EMA{ep}",
            },
            {
                "id": "E2",
                "left": {"type": "rsi", "period": 14},
                "op": "lt",
                "right": {"value": rsi_v},
                "text": f"RSI14 < {rsi_v}",
            },
        ],
        "exitConditions": [
            {
                "id": "X1",
                "left": {"type": "sma", "period": sp},
                "op": "crossBelow",
                "right": {"type": "ema", "period": ep},
                "text": f"SMA{sp} 下穿 EMA{ep}",
            }
        ],
        "risk": {"takeProfitPct": tp_v, "stopLossPct": sl_v, "maxHoldBars": 240},
    }

    # Generic code strategy using EMA/SMA/RSI signals.
    code = """
def _sma(series, period):
    return series.rolling(int(period)).mean()


def _ema(series, period):
    return series.ewm(span=int(period), adjust=False).mean()


def _rsi(series, period=14):
    diff = series.diff()
    up = diff.clip(lower=0)
    down = (-diff).clip(lower=0)
    roll_up = up.ewm(alpha=1 / period, adjust=False).mean()
    roll_down = down.ewm(alpha=1 / period, adjust=False).mean()
    rs = roll_up / roll_down.replace(0, 1e-12)
    return 100 - (100 / (1 + rs))


def build_signals(df, params):
    c = df["close"].astype(float)
    sma_p = int(params.get("sma", 20))
    ema_p = int(params.get("ema", 50))
    rsi_th = float(params.get("rsi_lt", 30))
    sma = _sma(c, sma_p)
    ema = _ema(c, ema_p)
    rsi = _rsi(c, 14)

    cross_up = (sma > ema) & (sma.shift(1) <= ema.shift(1))
    cross_dn = (sma < ema) & (sma.shift(1) >= ema.shift(1))
    long_entry = cross_up & (rsi < rsi_th)

    return {
        "long_entry": long_entry.fillna(False).tolist(),
        "short_entry": [False] * len(df),
        "long_exit": cross_dn.fillna(False).tolist(),
        "short_exit": [False] * len(df),
    }


def build_trade_plan(params):
    return {
        "risk_pct": float(params.get("risk_pct", 0.01)),
        "sl_pct": float(params.get("sl_pct", 0.015)),
        "tp_levels": [float(params.get("tp", 0.03))],
        "tp_qty": [1.0],
        "entry_next_open": True,
        "conflict_policy": "SL_FIRST",
        "stage_effect": "NEXT_BAR",
        "ratchet_to": "TP1",
    }
""".strip()

    summary = [
        "已按聊天内容生成可执行策略代码",
        "支持真实市场数据回测并返回可审计结果",
    ]
    return strategy, code, summary


def generate_strategy_code_artifacts(user_input: str, model: str, api_key: str = None, base_url: str = None) -> Tuple[dict, str, list[str]]:
    txt = (user_input or "").lower()
    txt_orig = user_input or ""
    
    # OC Cross 策略识别（支持中英文多种表述）
    looks_like_oc = (
        ("oc cross" in txt)
        or ("open" in txt and "close" in txt and ("alma" in txt or "cross" in txt))
        or ("open" in txt_orig and "close" in txt_orig and ("交叉" in txt_orig or "上穿" in txt_orig or "下穿" in txt_orig))
        or ("alma" in txt and ("open" in txt or "close" in txt))
        or ("三段止盈" in txt_orig or "分阶段" in txt_orig or "锁盈" in txt_orig)
    )
    if looks_like_oc:
        return _build_oc_cross_artifacts()

    # If API key is available, keep existing LLM route for condition strategy and pair with generic code template.
    effective_api_key = api_key or os.getenv("LLM_API_KEY")
    if effective_api_key:
        try:
            strategy, raw = parse_strategy_with_llm(user_input, model, api_key=effective_api_key, base_url=base_url)
            _s, code, summary = _build_regex_strategy(user_input)
            summary.insert(0, "LLM Successfully Generated Strategy")
            return strategy, code, summary + [f"LLM raw: {raw[:160]}..."]
        except Exception as exc:
            _s, code, summary = _build_regex_strategy(user_input)
            summary.insert(0, "LLM unavailable, fallback to local parser")
            # 区分 API Key 错误和其他错误
            err_msg = str(exc)
            if "401" in err_msg or "API key" in err_msg or "Incorrect API" in err_msg:
                summary.append(f"❌ API Key 错误：请检查 API Key 是否正确配置 (HTTP 401)")
                summary.append(f"💡 提示：阿里云 DashScope API Key 格式通常为 sk-...")
            else:
                summary.append(f"LLM error: {err_msg[:180]}")
            return _s, code, summary

    return _build_regex_strategy(user_input)
