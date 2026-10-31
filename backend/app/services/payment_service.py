from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models import Invoice, Payment


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def get_paid_amount(invoice: Invoice) -> Decimal:
    return money(
        sum(
            (
                payment.amount
                for payment in invoice.payments
                if payment.status == "completed"
            ),
            Decimal("0.00"),
        )
    )


def get_outstanding_amount(invoice: Invoice) -> Decimal:
    return money(invoice.total_amount - get_paid_amount(invoice))


def record_payment(
    db: Session,
    invoice_id: int,
    amount: Decimal,
    payment_method: str,
    transaction_reference: str | None = None,
) -> Payment:
    amount = money(amount)

    if amount <= Decimal("0.00"):
        raise ValueError("Payment amount must be greater than zero.")

    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .with_for_update()
        .first()
    )

    if invoice is None:
        raise ValueError("Invoice not found.")

    if invoice.status not in ("confirmed", "partially_paid"):
        raise ValueError(
            "Payments can only be recorded against confirmed invoices."
        )

    outstanding = get_outstanding_amount(invoice)

    if outstanding <= Decimal("0.00"):
        raise ValueError("This invoice has no outstanding balance.")

    if amount > outstanding:
        raise ValueError(
            f"Payment exceeds the outstanding balance of {outstanding}."
        )

    payment = Payment(
        invoice_id=invoice.id,
        amount=amount,
        payment_method=payment_method,
        transaction_reference=transaction_reference,
        payment_date=datetime.utcnow(),
        status="completed",
    )

    db.add(payment)
    db.flush()

    new_outstanding = money(outstanding - amount)

    if new_outstanding == Decimal("0.00"):
        invoice.status = "paid"
    else:
        invoice.status = "partially_paid"

    try:
        db.commit()
        db.refresh(payment)
    except Exception:
        db.rollback()
        raise

    return payment