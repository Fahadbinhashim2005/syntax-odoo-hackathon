from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Invoice, Payment

router = APIRouter(prefix="/api/dashboard", tags=["Finance Dashboard"])


@router.get("/finance")
def get_finance_dashboard(db: Session = Depends(get_db)):
    # Total revenue from successfully completed payments
    total_revenue = (
        db.query(Payment)
        .filter(Payment.status == "completed")
        .all()
    )

    revenue = sum(
        (payment.amount for payment in total_revenue),
        Decimal("0.00"),
    )

    # Consider confirmed and partially paid invoices active.
    active_invoices = (
        db.query(Invoice)
        .filter(Invoice.status.in_(["confirmed", "partially_paid"]))
        .all()
    )

    total_outstanding = sum(
        (invoice.outstanding_amount for invoice in active_invoices),
        Decimal("0.00"),
    )

    # Invoice counts
    total_invoice_count = db.query(Invoice).count()

    paid_invoice_count = (
        db.query(Invoice)
        .filter(Invoice.status == "paid")
        .count()
    )

    # Overdue invoices: active invoices past their due date
    overdue_invoices = [
        invoice
        for invoice in active_invoices
        if invoice.due_date < date.today()
    ]

    overdue_amount = sum(
        (invoice.outstanding_amount for invoice in overdue_invoices),
        Decimal("0.00"),
    )

    return {
        "total_revenue": str(revenue),
        "total_outstanding": str(total_outstanding),
        "total_invoices": total_invoice_count,
        "paid_invoices": paid_invoice_count,
        "overdue_invoice_count": len(overdue_invoices),
        "overdue_amount": str(overdue_amount),
    }