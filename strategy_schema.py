from __future__ import annotations

from datetime import datetime
from typing import Dict, List


INSTRUMENT_MAP: Dict[str, str] = {
    "XAUUSD": "XAU/USD",
    "XAUUSD_CFD": "XAU/USD",
    "EURUSD": "EUR/USD",
    "BTCUSD": "BTC/USD",
    "CME_ES": "SPY.US/USD",
    "CME_MES": "SPY.US/USD",
}

TIMEFRAME_MAP: Dict[str, str] = {
    "1m": "1MIN",
    "5m": "5MIN",
    "15m": "15MIN",
    "30m": "30MIN",
    "1H": "1HOUR",
    "4H": "4HOUR",
    "1D": "1DAY",
}


def normalize_market_id(market_id: str) -> str:
    m = str(market_id or "").strip().upper()
    aliases = {
        "XAUUSD": "XAUUSD",
        "XAUUSD_CFD": "XAUUSD_CFD",
        "ES": "CME_ES",
        "SPY": "CME_ES",
        "MES": "CME_MES",
    }
    return aliases.get(m, m)


def normalize_timeframe(tf: str) -> str:
    raw = str(tf or "").strip()
    aliases = {"1h": "1H", "h1": "1H", "4h": "4H", "h4": "4H", "d": "1D", "1d": "1D"}
    return aliases.get(raw.lower(), raw)


def fetch_ohlcv_bars(market_id: str, timeframe: str, start_date: str, end_date: str) -> List[Dict]:
    market = normalize_market_id(market_id)
    tf = normalize_timeframe(timeframe)

    instrument = INSTRUMENT_MAP.get(market)
    interval = TIMEFRAME_MAP.get(tf)

    if not instrument:
        raise ValueError(f"Unsupported market_id for real data: {market}")
    if not interval:
        raise ValueError(f"Unsupported timeframe for real data: {tf}")

    try:
        from dukascopy_python import fetch
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Dukascopy dependency missing: dukascopy_python. Install with `pip install dukascopy-python`."
        ) from exc

    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        df = fetch(
            instrument=instrument,
            interval=interval,
            offer_side="B",
            start=start_dt,
            end=end_dt,
        )
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch Dukascopy data: {exc}") from exc

    if df is None or df.empty:
        raise RuntimeError(f"No market data returned for {instrument} {interval} ({start_date} -> {end_date})")

    df = df.reset_index()
    if "index" in df.columns:
        df = df.rename(columns={"index": "timestamp"})

    out = []
    for _, row in df.iterrows():
        out.append(
            {
                "timestamp": str(row["timestamp"]),
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": float(row.get("volume", 0.0)),
            }
        )

    if len(out) < 50:
        raise RuntimeError(f"Insufficient market bars from Dukascopy: {len(out)}")

    return out
