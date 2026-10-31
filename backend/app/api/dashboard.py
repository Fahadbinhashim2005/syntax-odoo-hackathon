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
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Invoice, Payment

router = APIRouter(prefix="/api/dashboard", tags=["Finance Dashboard"])


def money(value: Decimal) -> Decimal:
    """Round monetary values to two decimal places."""
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


@router.get("/finance")
def get_finance_dashboard(db: Session = Depends(get_db)):
    # Total revenue from successfully completed payments.
    completed_payments = (
        db.query(Payment)
        .filter(Payment.status == "completed")
        .all()
    )

    revenue = money(
        sum(
            (payment.amount for payment in completed_payments),
            Decimal("0.00"),
        )
    )

    # Consider confirmed and partially paid invoices active.
    active_invoices = (
        db.query(Invoice)
        .filter(
            Invoice.status.in_(["confirmed", "partially_paid"])
        )
        .all()
    )

    total_outstanding = money(
        sum(
            (
                invoice.outstanding_amount
                for invoice in active_invoices
            ),
            Decimal("0.00"),
        )
    )

    # Total invoice count, including drafts and cancelled invoices.
    total_invoice_count = db.query(Invoice).count()

    # Count invoices that have been fully paid.
    paid_invoice_count = (
        db.query(Invoice)
        .filter(Invoice.status == "paid")
        .count()
    )

    # Find active invoices whose due dates have passed.
    overdue_invoices = [
        invoice
        for invoice in active_invoices
        if invoice.due_date < date.today()
        and invoice.outstanding_amount > Decimal("0.00")
    ]

    overdue_amount = money(
        sum(
            (
                invoice.outstanding_amount
                for invoice in overdue_invoices
            ),
            Decimal("0.00"),
        )
    )

    return {
        "total_revenue": str(revenue),
        "total_outstanding": str(total_outstanding),
        "total_invoices": total_invoice_count,
        "paid_invoices": paid_invoice_count,
        "overdue_invoice_count": len(overdue_invoices),
        "overdue_amount": str(overdue_amount),
    }
