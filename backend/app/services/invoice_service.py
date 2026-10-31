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