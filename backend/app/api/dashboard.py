from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import FinanceStats
from app.services.dashboard_service import get_finance_stats, get_revenue_report
from app.core.security import get_current_user

router = APIRouter(prefix="/api", tags=["Dashboard & Reports"])

@router.get("/dashboard/finance", response_model=FinanceStats)
def get_finance_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_finance_stats(db)

@router.get("/reports/revenue")
def get_revenue_reports(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_revenue_report(db, from_date, to_date)
