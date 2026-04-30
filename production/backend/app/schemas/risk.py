from pydantic import BaseModel
from typing import List


class RiskProduct(BaseModel):
    product_id: str
    product_name: str
    risk_label: str
    risk_probability: float
    risk_factors: List[str]
    recommendation: str


class RiskSummary(BaseModel):
    high_count: int
    medium_count: int
    low_count: int


class RiskMatrixResponse(BaseModel):
    period: str
    products: List[RiskProduct]
    summary: RiskSummary


class ProductRiskDetail(BaseModel):
    product_id: str
    product_name: str
    risk_label: str
    risk_probability: float
    risk_factors: List[str]
    recommendation: str
    profit_trend_slope: float
    profit_margin_pct: float
    avg_discount_rate: float
    cost_growth_pct: float
    yoy_revenue_change: float
