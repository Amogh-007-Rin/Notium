from pydantic import BaseModel
from typing import Optional, List, Dict


class SimulatorAdjustments(BaseModel):
    cost_change_pct: float = 0.0
    discount_rate_change: float = 0.0
    volume_change_pct: float = 0.0
    price_change_pct: float = 0.0


class SimulatorRequest(BaseModel):
    product_id: str
    adjustments: SimulatorAdjustments


class MetricsSnapshot(BaseModel):
    revenue: float
    cost: float
    profit: float
    margin_pct: float


class SimulatorDelta(BaseModel):
    profit_change: float
    profit_change_pct: float
    margin_change_pct: float


class SimulatorResponse(BaseModel):
    product_id: str
    product_name: str
    baseline: MetricsSnapshot
    scenario: MetricsSnapshot
    delta: SimulatorDelta
    narrative: str
    sensitivity: Optional[List[Dict]] = None


class SensitivityRequest(BaseModel):
    product_id: str
    parameter: str
    base_adjustments: SimulatorAdjustments


class SensitivityPoint(BaseModel):
    parameter_value: float
    projected_profit: float


class SensitivityResponse(BaseModel):
    product_id: str
    parameter: str
    points: List[SensitivityPoint]
