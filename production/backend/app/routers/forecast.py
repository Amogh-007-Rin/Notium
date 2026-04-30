from fastapi import APIRouter, Depends, Query, HTTPException
from app.utils.auth import get_current_user
from app.state import app_state

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.get("/predict")
def predict(
    product: str = Query(...),
    horizon: int = Query(3, ge=1, le=12),
    current_user=Depends(get_current_user),
):
    if not app_state.forecaster:
        raise HTTPException(status_code=503, detail="Forecast model not loaded")

    result = app_state.forecaster.forecast(product, horizon)
    return {
        "product_id": result.product_id,
        "product_name": result.product_name,
        "horizon_months": result.horizon_months,
        "historical": result.historical,
        "forecast": result.forecast if result.forecast else None,
        "at_risk": result.at_risk,
        "confidence_level": result.confidence_level,
        "model_accuracy": {"mae": result.mae, "mape": result.mape},
        "warning": result.warning,
    }


@router.get("/at-risk-products")
def at_risk_products(current_user=Depends(get_current_user)):
    if not app_state.forecaster:
        raise HTTPException(status_code=503, detail="Forecast model not loaded")
    return {"at_risk_products": app_state.forecaster.get_at_risk_products()}
