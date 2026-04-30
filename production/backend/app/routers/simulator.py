from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.schemas.simulator import SimulatorRequest, SensitivityRequest
from app.services import simulator as sim_service

router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.post("/run")
def run_simulation(
    body: SimulatorRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    adjustments = body.adjustments.model_dump()
    result = sim_service.run_simulation(db, body.product_id, adjustments)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for product {body.product_id}")
    return result


@router.post("/sensitivity")
def sensitivity(
    body: SensitivityRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    base_adj = body.base_adjustments.model_dump()
    points = sim_service.run_sensitivity(db, body.product_id, body.parameter, base_adj)
    return {
        "product_id": body.product_id,
        "parameter": body.parameter,
        "points": points,
    }
