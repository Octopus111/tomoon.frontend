from __future__ import annotations

import re
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


ConditionOp = Literal["crossAbove", "crossBelow", "gt", "lt"]
IndicatorType = Literal["sma", "ema", "rsi", "price"]


class IndicatorRef(BaseModel):
    type: IndicatorType
    period: Optional[int] = None


class ValueRef(BaseModel):
    value: float


class StrategyCondition(BaseModel):
    id: str
    left: IndicatorRef
    op: ConditionOp
    right: Dict[str, Any]
    text: str


class StrategyRisk(BaseModel):
    takeProfitPct: float = 0.03
    stopLossPct: float = 0.015
    maxHoldBars: int = 240


class StrategySchema(BaseModel):
    name: str = "AI Strategy"
    entryLogic: Literal["AND", "OR"] = "AND"
    exitLogic: Literal["AND", "OR"] = "OR"
    entryConditions: List[StrategyCondition] = Field(default_factory=list)
    exitConditions: List[StrategyCondition] = Field(default_factory=list)
    risk: StrategyRisk = Field(default_factory=StrategyRisk)


class ParseStrategyRequest(BaseModel):
    user_input: str
    model: str = "qwen-plus"
    api_key: Optional[str] = None
    base_url: Optional[str] = None


class ParseStrategyResponse(BaseModel):
    strategy: StrategySchema
    raw_model_output: str


class GenerateCodeRequest(BaseModel):
    user_input: str
    model: str = "qwen-plus"
    api_key: Optional[str] = None
    base_url: Optional[str] = None


class GenerateCodeResponse(BaseModel):
    strategy: StrategySchema
    strategy_code: str
    summary: List[str] = Field(default_factory=list)


class BacktestRequest(BaseModel):
    strategy_id: str = "STR-AI-001"
    strategy_name: str = "AI Strategy"
    market_id: str = "XAUUSD"
    resolution: str = "5m"
    from_date: str = "2024-01-01"
    to_date: str = "2024-02-01"
    initial_capital: float = 100000
    commission: float = 2.5
    slippage_pct: float = 0.0005
    entryLogic: Literal["AND", "OR"] = "AND"
    exitLogic: Literal["AND", "OR"] = "OR"
    entry_conditions: List[StrategyCondition]
    exit_conditions: List[StrategyCondition] = Field(default_factory=list)
    risk: StrategyRisk = Field(default_factory=StrategyRisk)


class CodeBacktestRequest(BaseModel):
    strategy_id: str = "STR-CODE-001"
    strategy_name: str = "AI Code Strategy"
    market_id: str = "XAUUSD"
    resolution: str = "15m"
    from_date: str = "2024-01-01"
    to_date: str = "2024-02-01"
    initial_capital: float = 100000
    commission: float = 2.5
    spread_pct: float = 0.0002
    slippage_pct: float = 0.0005
    strategy_code: str
    params: Dict[str, Any] = Field(default_factory=dict)


class BacktestResponse(BaseModel):
    run_id: str
    strategy_id: str
    engine: str
    metrics: Dict[str, Any]
    chart_data: Dict[str, Any]
    equity_curve: List[Dict[str, Any]]
    trades: List[Dict[str, Any]]
    warnings: List[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str


class EarlyAccessSubscribeRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    source: str = Field(default="landingpage")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not re.match(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", email):
            raise ValueError("Invalid email format")
        return email


class EarlyAccessSubscribeResponse(BaseModel):
    success: bool
    message: str
