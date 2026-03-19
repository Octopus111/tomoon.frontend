from __future__ import annotations

import json
from typing import Any, Dict

from pydantic import ValidationError

from .models import StrategySchema


def extract_first_json_object(text: str) -> Dict[str, Any]:
    start = text.find("{")
    if start < 0:
        raise ValueError("No JSON object found in model output")

    depth = 0
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                obj_str = text[start : i + 1]
                return json.loads(obj_str)

    raise ValueError("Unclosed JSON object in model output")


def validate_strategy_payload(payload: Dict[str, Any]) -> StrategySchema:
    try:
        strategy = StrategySchema.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(f"Schema validation failed: {exc}") from exc

    if not strategy.entryConditions:
        raise ValueError("entryConditions cannot be empty")

    for c in strategy.entryConditions + strategy.exitConditions:
        if c.left.type != "price" and (c.left.period is None or c.left.period <= 0):
            raise ValueError(f"Invalid left.period for condition {c.id}")

        right_type = c.right.get("type") if isinstance(c.right, dict) else None
        right_val = c.right.get("value") if isinstance(c.right, dict) else None
        if right_type is None and right_val is None:
            raise ValueError(f"Condition {c.id} must include right.type or right.value")

    return strategy
