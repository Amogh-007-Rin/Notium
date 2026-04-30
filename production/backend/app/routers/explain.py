from fastapi import APIRouter, Depends, Query, HTTPException
from app.utils.auth import get_current_user
from app.state import app_state

router = APIRouter(prefix="/explain", tags=["explain"])


@router.get("/month-change")
def month_change(
    product: str = Query(...),
    month: str = Query(..., description="Format: YYYY-MM"),
    current_user=Depends(get_current_user),
):
    if not app_state.explainer:
        raise HTTPException(status_code=503, detail="Explainer model not loaded")

    result = app_state.explainer.explain(product, month)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data available for product {product} in {month}")

    return {
        "product_id": result.product_id,
        "product_name": result.product_name,
        "month": result.month,
        "previous_month": result.previous_month,
        "actual_profit": result.actual_profit,
        "previous_profit": result.previous_profit,
        "profit_change": result.profit_change,
        "profit_change_pct": result.profit_change_pct,
        "direction": result.direction,
        "narrative_summary": result.narrative_summary,
        "top_drivers": result.top_drivers,
        "exportable": True,
    }
