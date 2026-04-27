from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, LoginResponse, UserOut
from app.utils.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.last_login = datetime.utcnow()
    db.add(AuditLog(
        user_id=user.id,
        action="login",
        resource="auth",
        ip_address=request.client.host if request.client else "unknown",
    ))
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return LoginResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/logout")
def logout(request: Request, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    db.add(AuditLog(
        user_id=current_user.id,
        action="logout",
        resource="auth",
        ip_address=request.client.host if request.client else "unknown",
    ))
    db.commit()
    return {"message": "Logged out successfully"}
