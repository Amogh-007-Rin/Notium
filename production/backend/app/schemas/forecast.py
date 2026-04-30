from pydantic import BaseModel
from typing import Optional, List


class ForecastPoint(BaseModel):
    period: str
    predicted_profit: float
    lower_bound: float
    upper_bound: float


class HistoricalPoint(BaseModel):
    period: str
    actual_profit: float


class ModelAccuracy(BaseModel):
    mae: float
    mape: float


class ForecastResponse(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    horizon_months: Optional[int] = None
    historical: Optional[List[HistoricalPoint]] = None
    forecast: Optional[List[ForecastPoint]] = None
    at_risk: Optional[bool] = None
    confidence_level: Optional[float] = None
    model_accuracy: Optional[ModelAccuracy] = None
    warning: Optional[str] = None


class AtRiskProduct(BaseModel):
    product_id: str
    product_name: str
    predicted_decline_pct: float
    next_period: str


class AtRiskResponse(BaseModel):
    at_risk_products: List[AtRiskProduct]
