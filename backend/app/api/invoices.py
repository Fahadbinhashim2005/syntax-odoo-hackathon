from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services.invoice_service import create_invoice

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_invoice_endpoint(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_invoice(db, data)
    except ValueError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.get("", response_model=list[InvoiceResponse])
def list_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).order_by(Invoice.id.desc()).all()


# Keep this route before /{invoice_id} so "overdue" is not
# interpreted as an invoice ID.
@router.get("/overdue")
def get_overdue_invoices(db: Session = Depends(get_db)):
    overdue_invoices = (
        db.query(Invoice)
        .filter(
            Invoice.status.in_(["confirmed", "partially_paid"]),
            Invoice.due_date < date.today(),
        )
        .order_by(Invoice.due_date.asc())
        .all()
    )

    results = []

    for invoice in overdue_invoices:
        outstanding = invoice.outstanding_amount

        # Exclude invoices with no remaining balance.
        if outstanding <= 0:
            continue

        results.append(
            {
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "customer_id": invoice.customer_id,
                "issue_date": invoice.issue_date,
                "due_date": invoice.due_date,
                "total_amount": invoice.total_amount,
                "paid_amount": invoice.paid_amount,
                "outstanding_amount": outstanding,
                "days_overdue": (date.today() - invoice.due_date).days,
                "status": invoice.status,
            }
        )

    return results


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found.",
        )

    return invoice


@router.post("/{invoice_id}/confirm", response_model=InvoiceResponse)
def confirm_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found.",
        )

    if invoice.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft invoices can be confirmed.",
        )

    invoice.status = "