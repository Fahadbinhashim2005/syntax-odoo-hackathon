from datetime import date, timedelta, datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.quotation import Quotation
from app.models.subscription import Subscription
from app.models.plan import Plan
from app.models.customer import Customer
from app.models.user import User
from app.schemas.quotation import QuotationCreate
from app.services.subscription_service import create_subscription, calculate_next_billing_date

def generate_quotation_number(db: Session) -> str:
    max_id = db.query(func.max(Quotation.id)).scalar() or 0
    return f"QT-2026-{(max_id + 1):03d}"

def calculate_quotation_total(unit_price: float, quantity: int, discount_amount: float, tax_amount: float) -> float:
    subtotal = unit_price * quantity
    total = max(0.0, subtotal - discount_amount + tax_amount)
    return round(total, 2)

def create_quotation(db: Session, data: QuotationCreate, created_by: Optional[int] = None) -> Quotation:
    # Validate customer
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise ValueError("Customer not found")

    # Validate plan
    plan = db.query(Plan).filter(Plan.id == data.plan_id).first()
    if not plan:
        raise ValueError("Subscription plan not found")

    quotation_number = generate_quotation_number(db)
    
    # Financial validation: ensure server computes verified financial figures
    quantity = max(1, data.quantity)
    unit_price = data.unit_price if data.unit_price > 0 else plan.price
    discount_amount = max(0.0, data.discount_amount)
    tax_amount = max(0.0, data.tax_amount)
    total = calculate_quotation_total(unit_price, quantity, discount_amount, tax_amount)
    
    valid_until = data.valid_until or (date.today() + timedelta(days=30))
    status = data.status if data.status in ["draft", "sent"] else "draft"
    
    quotation = Quotation(
        quotation_number=quotation_number,
        customer_id=customer.id,
        plan_id=plan.id,
        product_id=data.product_id or plan.product_id,
        quantity=quantity,
        unit_price=unit_price,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total,
        status=status,
        valid_until=valid_until,
        notes=data.notes,
        created_by=created_by
    )
    db.add(quotation)
    db.commit()
    db.refresh(quotation)
    return quotation

def confirm_quotation(
    db: Session,
    quotation_id: int,
    actor_user: Optional[User] = None,
    start_date: Optional[date] = None,
    notes: Optional[str] = None
) -> Subscription:
    # 1. Fetch quotation
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise ValueError("Quotation not found")

    # 2. Prevent duplicate conversion
    if quotation.status == "converted":
        existing_sub = db.query(Subscription).filter(Subscription.quotation_id == quotation.id).first()
        sub_ref = f" (Subscription: {existing_sub.subscription_number})" if existing_sub else ""
        raise ValueError(f"Quotation has already been converted to an active subscription{sub_ref}")

    # 3. Validate status eligibility
    if quotation.status in ["cancelled", "rejected"]:
        raise ValueError(f"Cannot convert a {quotation.status} quotation")

    # 4. Validate validity / expiry
    if quotation.valid_until and quotation.valid_until < date.today():
        raise ValueError(f"Cannot convert expired quotation (expired on {quotation.valid_until})")

    # 5. Check if subscription already created for this quotation
    existing = db.query(Subscription).filter(Subscription.quotation_id == quotation.id).first()
    if existing:
        raise ValueError(f"Subscription {existing.subscription_number} is already linked to this quotation")

    # 6. Fetch plan & dates
    plan = db.query(Plan).filter(Plan.id == quotation.plan_id).first()
    if not plan:
        raise ValueError("Associated subscription plan not found")

    effective_start_date = start_date or date.today()
    freq = plan.billing_frequency or "monthly"
    next_billing_date = calculate_next_billing_date(effective_start_date, freq)

    # 7. Use atomic transaction
    try:
        # Mark quotation as converted
        quotation.status = "converted"
        quotation.updated_at = datetime.utcnow()

        sub_data = {
            "customer_id": quotation.customer_id,
            "plan_id": quotation.plan_id,
            "quotation_id": quotation.id,
            "quantity": quotation.quantity,
            "unit_price": quotation.unit_price,
            "discount_amount": quotation.discount_amount,
            "tax_amount": quotation.tax_amount,
            "start_date": effective_start_date,
            "end_date": None,
            "next_billing_date": next_billing_date,
            "status": "confirmed",
            "notes": notes or f"Agreed commercial terms from quotation {quotation.quotation_number}"
        }

        subscription = create_subscription(
            db=db,
            data=sub_data,
            actor_user=actor_user,
            is_conversion=True
        )

        db.commit()
        db.refresh(quotation)
        return subscription
    except Exception as e:
        db.rollback()
        raise e
