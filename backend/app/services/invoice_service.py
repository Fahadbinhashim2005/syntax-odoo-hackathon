from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from app.models.invoice import Invoice
from app.models.subscription import Subscription
from app.models.plan import Plan

def generate_invoice_number(db: Session) -> str:
    count = db.query(Invoice).count() + 1
    return f"INV-2026-{count:03d}"

def generate_invoice_for_subscription(db: Session, subscription: Subscription) -> Invoice:
    inv_number = generate_invoice_number(db)
    issue_date = date.today()
    due_date = issue_date + timedelta(days=30)
    subtotal = subscription.unit_price * subscription.quantity
    
    invoice = Invoice(
        invoice_number=inv_number,
        subscription_id=subscription.id,
        customer_id=subscription.customer_id,
        issue_date=issue_date,
        due_date=due_date,
        subtotal=subtotal,
        discount_amount=subscription.discount_amount,
        tax_amount=subscription.tax_amount,
        total_amount=subscription.total_amount,
        paid_amount=0.0,
        status="draft",
        notes=f"Auto-generated invoice for subscription {subscription.subscription_number}"
    )
    db.add(invoice)
    
    # Update next_billing_date on subscription
    from app.services.subscription_service import calculate_next_billing_date
    plan = db.query(Plan).filter(Plan.id == subscription.plan_id).first()
    freq = plan.billing_frequency if plan else "monthly"
    base_date = subscription.next_billing_date or date.today()
    subscription.next_billing_date = calculate_next_billing_date(base_date, freq)
    
    db.commit()
    db.refresh(invoice)
    return invoice

def confirm_invoice(db: Session, invoice_id: int) -> Invoice:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise ValueError("Invoice not found")
    invoice.status = "confirmed"
    invoice.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(invoice)
    return invoice

def cancel_invoice(db: Session, invoice_id: int) -> Invoice:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise ValueError("Invoice not found")
    invoice.status = "cancelled"
    invoice.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(invoice)
    return invoice

def update_paid_status(db: Session, invoice: Invoice) -> Invoice:
    paid = sum(p.amount for p in invoice.payments)
    invoice.paid_amount = paid
    
    if invoice.status != "cancelled":
        if paid >= invoice.total_amount and invoice.total_amount > 0:
            invoice.status = "paid"
        elif paid > 0:
            invoice.status = "partially_paid"
        elif invoice.due_date < date.today() and invoice.status in ["confirmed", "partially_paid"]:
            invoice.status = "overdue"
            
    invoice.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(invoice)
    return invoice

def get_overdue(db: Session):
    today = date.today()
    return db.query(Invoice).filter(
        Invoice.due_date < today,
        Invoice.status.in_(["confirmed", "partially_paid", "overdue"])
    ).all()
