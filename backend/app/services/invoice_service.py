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
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models import Invoice, InvoiceItem
from app.schemas.invoice import InvoiceCreate


def money(value: Decimal) -> Decimal:
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def create_invoice(db: Session, data: InvoiceCreate) -> Invoice:
    if data.due_date < date.today():
        raise ValueError("Due date cannot be in the past.")

    # Normalize prices before using them in calculations.
    normalized_items = [
        (
            item,
            money(item.unit_price),
        )
        for item in data.items
    ]

    subtotal = sum(
        (
            money(unit_price * item.quantity)
            for item, unit_price in normalized_items
        ),
        Decimal("0.00"),
    )

    discount = money(data.discount_amount)

    if discount > subtotal:
        raise ValueError("Discount cannot exceed the subtotal.")

    taxable_amount = subtotal - discount
    tax = money(
        taxable_amount * data.tax_rate / Decimal("100")
    )
    total = money(taxable_amount + tax)

    try:
        invoice = Invoice(
            invoice_number="TEMP",
            customer_id=data.customer_id,
            due_date=data.due_date,
            subtotal=subtotal,
            discount_amount=discount,
            tax_amount=tax,
            total_amount=total,
            status="draft",
        )

        db.add(invoice)
        db.flush()

        invoice.invoice_number = (
            f"INV-{date.today():%Y%m%d}-{invoice.id:06d}"
        )

        for item_data, unit_price in normalized_items:
            line_total = money(
                unit_price * item_data.quantity
            )

            invoice.items.append(
                InvoiceItem(
                    description=item_data.description,
                    quantity=item_data.quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )
            )

        db.commit()
        db.refresh(invoice)

        return invoice

    except Exception:
        db.rollback()
        raise
