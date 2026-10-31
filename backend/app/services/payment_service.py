from datetime import date, datetime
from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.invoice import Invoice
from app.services.invoice_service import update_paid_status

def generate_payment_number(db: Session) -> str:
    count = db.query(Payment).count() + 1
    return f"PAY-2026-{count:03d}"

def record_payment(
    db: Session,
    invoice_id: int,
    amount: float,
    payment_method: str = "upi",
    payment_date: date = None,
    reference: str = None,
    notes: str = None
) -> Payment:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise ValueError("Invoice not found")
        
    payment_number = generate_payment_number(db)
    payment = Payment(
        payment_number=payment_number,
        invoice_id=invoice.id,
        customer_id=invoice.customer_id,
        amount=amount,
        payment_date=payment_date or date.today(),
        payment_method=payment_method,
        reference=reference,
        notes=notes
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Recalculate invoice status
    update_paid_status(db, invoice)
    
    return payment

def get_payments_for_invoice(db: Session, invoice_id: int):
    return db.query(Payment).filter(Payment.invoice_id == invoice_id).all()
