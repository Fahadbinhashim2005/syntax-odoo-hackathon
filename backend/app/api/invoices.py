from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.invoice import Invoice
from app.models.user import User
from app.models.customer import Customer
from app.schemas.invoice import InvoiceCreate, InvoiceOut
from app.services.invoice_service import (
    generate_invoice_for_subscription,
    confirm_invoice,
    cancel_invoice,
    get_overdue
)
from app.services.subscription_service import get_due_for_billing
from app.core.security import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("", response_model=List[InvoiceOut])
def list_invoices(
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice)
    
    if current_user.role == "customer":
        cust = db.query(Customer).filter(Customer.email == current_user.email).first()
        if cust:
            query = query.filter(Invoice.customer_id == cust.id)
        else:
            return []
    else:
        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)
        if status and status != "all":
            query = query.filter(Invoice.status == status.lower())
        if from_date:
            query = query.filter(Invoice.issue_date >= from_date)
        if to_date:
            query = query.filter(Invoice.issue_date <= to_date)
        if search:
            query = query.filter(
                (Invoice.invoice_number.ilike(f"%{search}%")) |
                (Invoice.customer.has(name=search))
            )
            
    return query.order_by(Invoice.created_at.desc()).all()

@router.get("/overdue", response_model=List[InvoiceOut])
def list_overdue_invoices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_overdue(db)

@router.post("/generate", response_model=List[InvoiceOut])
def auto_generate_invoices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    due_subs = get_due_for_billing(db)
    generated = []
    for sub in due_subs:
        inv = generate_invoice_for_subscription(db, sub)
        generated.append(inv)
    return generated

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if current_user.role == "customer" and invoice.customer.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    return invoice

@router.post("/{invoice_id}/confirm", response_model=InvoiceOut)
def confirm_inv(invoice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return confirm_invoice(db, invoice_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{invoice_id}/cancel", response_model=InvoiceOut)
def cancel_inv(invoice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return cancel_invoice(db, invoice_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services.invoice_service import create_invoice

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


# Create a new invoice
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


# List all invoices
@router.get("", response_model=list[InvoiceResponse])
def list_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).order_by(Invoice.id.desc()).all()


# List overdue invoices
# This route must appear before /{invoice_id}.
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
                "days_overdue": (
                    date.today() - invoice.due_date
                ).days,
                "status": invoice.status,
            }
        )

    return results


# Get a specific invoice
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


# Confirm a draft invoice
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

    invoice.status = "confirmed"
    db.commit()
    db.refresh(invoice)

    return invoice


# Cancel a draft invoice
@router.post("/{invoice_id}/cancel", response_model=InvoiceResponse)
def cancel_invoice(invoice_id: int, db: Session = Depends(get_db)):
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
            detail="Only draft invoices can be cancelled.",
        )

    invoice.status = "cancelled"
    db.commit()
    db.refresh(invoice)

    return invoice
