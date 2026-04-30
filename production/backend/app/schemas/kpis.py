from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class KPISummary(BaseModel):
    total_revenue: float
    total_cost: float
    total_profit: float
    profit_margin_pct: float
    cost_to_revenue_ratio: float
    yoy_growth_pct: float
    mom_change_pct: float
    data_quality_score: float
    last_refreshed: str
    filters_applied: Dict[str, Any]


class ProductKPI(BaseModel):
    product_id: str
    product_name: str
    category: str
    segment: str
    revenue: float
    cost: float
    profit: float
    profit_margin_pct: float
    yoy_growth_pct: float
    discount_impact_ratio: float
    risk_label: str
    risk_probability: float


class TimeSeriesPoint(BaseModel):
    period: str
    revenue: float
    cost: float
    profit: float
    margin_pct: float


class TimeSeriesResponse(BaseModel):
    product: str
    granularity: str
    series: List[TimeSeriesPoint]


class SegmentKPI(BaseModel):
    segment: str
    revenue: float
    cost: float
    profit: float
    profit_margin_pct: float
    product_count: int
