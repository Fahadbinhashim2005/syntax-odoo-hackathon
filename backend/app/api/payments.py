from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.payment import Payment
from app.models.user import User
from app.models.customer import Customer
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.payment_service import record_payment, get_payments_for_invoice
from app.core.security import get_current_user

router = APIRouter(prefix="/api", tags=["Payments"])

@router.get("/payments", response_model=List[PaymentOut])
def list_payments(
    method: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Payment)
    
    if current_user.role == "customer":
        cust = db.query(Customer).filter(Customer.email == current_user.email).first()
        if cust:
            query = query.filter(Payment.customer_id == cust.id)
        else:
            return []
    else:
        if method and method != "all":
            query = query.filter(Payment.payment_method == method.lower())
        if from_date:
            query = query.filter(Payment.payment_date >= from_date)
        if to_date:
            query = query.filter(Payment.payment_date <= to_date)
        if search:
            query = query.filter(
                (Payment.payment_number.ilike(f"%{search}%")) |
                (Payment.reference.ilike(f"%{search}%"))
            )
            
    return query.order_by(Payment.created_at.desc()).all()

@router.post("/payments", response_model=PaymentOut)
def make_payment(
    req: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Invoice, Payment
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import record_payment

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
):
    try:
        return record_payment(
            db=db,
            invoice_id=req.invoice_id,
            amount=req.amount,
            payment_method=req.payment_method,
            payment_date=req.payment_date,
            reference=req.reference,
            notes=req.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/payments/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.get("/invoices/{invoice_id}/payments", response_model=List[PaymentOut])
def list_invoice_payments(invoice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_payments_for_invoice(db, invoice_id)
            invoice_id=data.invoice_id,
            amount=data.amount,
            payment_method=data.payment_method,
            transaction_reference=data.transaction_reference,
        )
    except ValueError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.get("", response_model=list[PaymentResponse])
def list_payments(db: Session = Depends(get_db)):
    return db.query(Payment).order_by(Payment.id.desc()).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found.",
        )

    return payment


@router.get(
    "/invoice/{invoice_id}",
    response_model=list[PaymentResponse],
)
def list_invoice_payments(
    invoice_id: int,
    db: Session = Depends(get_db),
):
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

    return (
        db.query(Payment)
        .filter(Payment.invoice_id == invoice_id)
        .order_by(Payment.id.desc())
        .all()
    )
