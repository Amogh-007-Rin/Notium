from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import require_role
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("finance_team")),
):
    offset = (page - 1) * limit
    total = db.query(AuditLog).count()
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "logs": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "action": l.action,
                "resource": l.resource,
                "ip_address": l.ip_address,
                "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            }
            for l in logs
        ],
    }
