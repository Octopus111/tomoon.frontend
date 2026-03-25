from __future__ import annotations

import os
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.backtest_engine import run_condition_backtest
from app.code_backtest_engine import run_code_backtest
from app.data_provider import fetch_ohlcv_bars
from app.llm_client import generate_strategy_code_artifacts, parse_strategy_with_llm
from app.models import (
    BacktestRequest,
    BacktestResponse,
    CodeBacktestRequest,
    GenerateCodeRequest,
    GenerateCodeResponse,
    HealthResponse,
    ParseStrategyRequest,
    ParseStrategyResponse,
)

app = FastAPI(title="ToMoon AI Backtest Studio", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = ROOT / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/api/agent/parse", response_model=ParseStrategyResponse)
def parse_strategy(req: ParseStrategyRequest) -> ParseStrategyResponse:
    try:
        strategy, raw_output = parse_strategy_with_llm(req.user_input, req.model, api_key=req.api_key, base_url=req.base_url)
    except Exception as exc:
        raise HTTPException(400, str(exc)) from exc
    return ParseStrategyResponse(strategy=strategy, raw_model_output=raw_output)


@app.post("/api/agent/generate-code", response_model=GenerateCodeResponse)
def generate_code(req: GenerateCodeRequest) -> GenerateCodeResponse:
    try:
        strategy, strategy_code, summary = generate_strategy_code_artifacts(req.user_input, req.model, api_key=req.api_key, base_url=req.base_url)
    except Exception as exc:
        raise HTTPException(400, str(exc)) from exc
    return GenerateCodeResponse(strategy=strategy, strategy_code=strategy_code, summary=summary)


@app.get("/api/market-data/bars")
def market_bars(market: str, timeframe: str, start_date: str, end_date: str):
    bars = fetch_ohlcv_bars(market, timeframe, start_date, end_date)
    return bars


@app.post("/api/backtest/condition/run", response_model=BacktestResponse)
def condition_backtest(req: BacktestRequest) -> BacktestResponse:
    t0 = time.time()
    try:
        bars = fetch_ohlcv_bars(req.market_id, req.resolution, req.from_date, req.to_date)
    except Exception as exc:
        raise HTTPException(502, f"Failed to fetch market data: {exc}") from exc

    if len(bars) < 50:
        raise HTTPException(400, f"Insufficient bars: {len(bars)}")

    result = run_condition_backtest(
        bars=bars,
        entry_logic=req.entryLogic,
        exit_logic=req.exitLogic,
        entry_conditions=[c.model_dump() for c in req.entry_conditions],
        exit_conditions=[c.model_dump() for c in req.exit_conditions],
        risk=req.risk.model_dump(),
        initial_capital=req.initial_capital,
        commission=req.commission,
        slippage_pct=req.slippage_pct,
    )

    return BacktestResponse(
        run_id=f"RUN-COND-{uuid.uuid4().hex[:6].upper()}",
        strategy_id=req.strategy_id,
        engine="condition_code_v1",
        metrics=result["metrics"],
        chart_data=result["chart_data"],
        equity_curve=result["equity_curve"],
        trades=result["trades"],
        warnings=[f"duration_s={round(time.time() - t0, 3)}"],
    )


@app.post("/api/backtest/code/run", response_model=BacktestResponse)
def code_backtest(req: CodeBacktestRequest) -> BacktestResponse:
    t0 = time.time()
    try:
        bars = fetch_ohlcv_bars(req.market_id, req.resolution, req.from_date, req.to_date)
    except Exception as exc:
        raise HTTPException(502, f"Failed to fetch market data: {exc}") from exc

    if len(bars) < 50:
        raise HTTPException(400, f"Insufficient bars: {len(bars)}")

    try:
        result = run_code_backtest(
            bars=bars,
            strategy_code=req.strategy_code,
            params=req.params,
            initial_capital=req.initial_capital,
            commission=req.commission,
            spread_pct=req.spread_pct,
            slippage_pct=req.slippage_pct,
        )
    except Exception as exc:
        raise HTTPException(400, f"Failed to execute strategy code: {exc}") from exc

    return BacktestResponse(
        run_id=f"RUN-CODE-{uuid.uuid4().hex[:6].upper()}",
        strategy_id=req.strategy_id,
        engine="strategy_code_v1",
        metrics=result["metrics"],
        chart_data=result["chart_data"],
        equity_curve=result["equity_curve"],
        trades=result["trades"],
        warnings=[f"duration_s={round(time.time() - t0, 3)}"],
    )


@app.get("/")
def index():
    path = FRONTEND_DIR / "index.html"
    if not path.exists():
        raise HTTPException(404, "frontend/index.html not found")
    return FileResponse(str(path))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8100"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
