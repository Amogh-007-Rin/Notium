from pydantic import BaseModel
from typing import List, Optional


class DriverDetail(BaseModel):
    feature: str
    display_name: str
    shap_value: float
    direction: str
    description: str


class ExplanationResponse(BaseModel):
    product_id: str
    product_name: str
    month: str
    previous_month: str
    actual_profit: float
    previous_profit: float
    profit_change: float
    profit_change_pct: float
    direction: str
    narrative_summary: str
    top_drivers: List[DriverDetail]
    exportable: bool = True
