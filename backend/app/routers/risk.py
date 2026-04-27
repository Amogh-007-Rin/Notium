from fastapi import APIRouter, Depends, Query, HTTPException
from app.utils.auth import get_current_user
from app.state import app_state

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/matrix")
def risk_matrix(
    period: str = Query("2024-Q4"),
    current_user=Depends(get_current_user),
):
    if not app_state.risk_classifier:
        raise HTTPException(status_code=503, detail="Risk classifier not loaded")

    all_risks = app_state.risk_classifier.predict_all()
    products = [
        {
            "product_id": r.product_id,
            "product_name": r.product_name,
            "risk_label": r.risk_label,
            "risk_probability": r.risk_probability,
            "risk_factors": r.risk_factors,
            "recommendation": r.recommendation,
        }
        for r in all_risks
    ]

    high = sum(1 for p in products if p["risk_label"] == "HIGH")
    medium = sum(1 for p in products if p["risk_label"] == "MEDIUM")
    low = sum(1 for p in products if p["risk_label"] == "LOW")

    return {
        "period": period,
        "products": products,
        "summary": {"high_count": high, "medium_count": medium, "low_count": low},
    }


@router.get("/product/{product_id}")
def product_risk(product_id: str, current_user=Depends(get_current_user)):
    if not app_state.risk_classifier:
        raise HTTPException(status_code=503, detail="Risk classifier not loaded")

    r = app_state.risk_classifier.predict_product(product_id)
    return {
        "product_id": r.product_id,
        "product_name": r.product_name,
        "risk_label": r.risk_label,
        "risk_probability": r.risk_probability,
        "risk_factors": r.risk_factors,
        "recommendation": r.recommendation,
        "profit_trend_slope": r.profit_trend_slope,
        "profit_margin_pct": r.profit_margin_pct,
        "avg_discount_rate": r.avg_discount_rate,
        "cost_growth_pct": r.cost_growth_pct,
        "yoy_revenue_change": r.yoy_revenue_change,
    }
