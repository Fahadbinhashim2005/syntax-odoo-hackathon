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
