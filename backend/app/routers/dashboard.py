from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.dependencies import require_roles


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(
    user: User = Depends(require_roles("admin", "staff", "customer")),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        return {"role": user.role}
    customers = db.scalar(
        select(func.count()).select_from(User).where(User.role == "customer", User.is_active.is_(True))
    ) or 0
    staff = db.scalar(
        select(func.count()).select_from(User).where(User.role == "staff", User.is_active.is_(True))
    ) or 0
    return {"role": user.role, "customers": customers, "staff": staff}
