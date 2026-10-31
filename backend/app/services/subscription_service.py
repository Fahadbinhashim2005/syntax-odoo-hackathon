from datetime import date, timedelta, datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.subscription import Subscription
from app.models.subscription_history import SubscriptionHistory
from app.models.plan import Plan
from app.models.customer import Customer
from app.models.user import User

def generate_subscription_number(db: Session) -> str:
    # Use max id or count to guarantee uniqueness
    max_id = db.query(func.max(Subscription.id)).scalar() or 0
    return f"SUB-2026-{(max_id + 1):03d}"

def calculate_next_billing_date(start_date: date, frequency: str) -> date:
    frequency = (frequency or "monthly").lower()
    if frequency == "daily":
        return start_date + timedelta(days=1)
    elif frequency == "weekly":
        return start_date + timedelta(days=7)
    elif frequency == "yearly":
        try:
            return start_date.replace(year=start_date.year + 1)
        except ValueError:
            return start_date + timedelta(days=365)
    else:  # monthly
        year = start_date.year + (start_date.month // 12)
        month = (start_date.month % 12) + 1
        day = min(start_date.day, 28)
        return date(year, month, day)

def record_subscription_event(
    db: Session,
    subscription_id: int,
    event_type: str,
    user_id: Optional[int] = None,
    user_name: Optional[str] = None,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    notes: Optional[str] = None
) -> SubscriptionHistory:
    history = SubscriptionHistory(
        subscription_id=subscription_id,
        event_type=event_type,
        user_id=user_id,
        user_name=user_name,
        previous_status=previous_status,
        new_status=new_status,
        notes=notes
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history

def create_subscription(
    db: Session,
    data: dict,
    actor_user: Optional[User] = None,
    is_conversion: bool = False
) -> Subscription:
    # Validate customer
    customer = db.query(Customer).filter(Customer.id == data["customer_id"]).first()
    if not customer:
        raise ValueError("Target customer does not exist")

    # Validate plan
    plan = db.query(Plan).filter(Plan.id == data["plan_id"]).first()
    if not plan:
        raise ValueError("Selected subscription plan does not exist")

    subscription_number = generate_subscription_number(db)
    quantity = max(1, int(data.get("quantity", 1)))
    unit_price = float(data.get("unit_price", plan.price))
    discount_amount = max(0.0, float(data.get("discount_amount", 0.0)))
    tax_amount = max(0.0, float(data.get("tax_amount", 0.0)))
    subtotal = unit_price * quantity
    total = max(0.0, subtotal - discount_amount + tax_amount)

    start_date = data.get("start_date") or date.today()
    freq = (data.get("billing_frequency") or plan.billing_frequency or "monthly").lower()
    next_billing_date = data.get("next_billing_date") or calculate_next_billing_date(start_date, freq)
    
    # Calculate end date if applicable
    end_date = data.get("end_date")

    status = data.get("status", "confirmed" if is_conversion else "draft")

    subscription = Subscription(
        subscription_number=subscription_number,
        customer_id=customer.id,
        plan_id=plan.id,
        quotation_id=data.get("quotation_id"),
        quantity=quantity,
        unit_price=unit_price,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total,
        status=status,
        start_date=start_date,
        end_date=end_date,
        next_billing_date=next_billing_date
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    # Record event in audit history
    event_type = "converted_from_quotation" if is_conversion else "created"
    notes = data.get("notes") or (
        f"Generated from quotation #{data.get('quotation_id')}" if is_conversion else "Direct subscription creation"
    )
    record_subscription_event(
        db=db,
        subscription_id=subscription.id,
        event_type=event_type,
        user_id=actor_user.id if actor_user else None,
        user_name=actor_user.name if actor_user else "System",
        previous_status=None,
        new_status=status,
        notes=notes
    )

    return subscription

def update_subscription_status(
    db: Session,
    sub_id: int,
    new_status: str,
    actor_user: Optional[User] = None,
    notes: Optional[str] = None,
    close_reason: Optional[str] = None,
    effective_date: Optional[date] = None
) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise ValueError("Subscription not found")

    old_status = sub.status
    if old_status == new_status:
        return sub

    # Validate state transitions
    if old_status == "closed":
        raise ValueError("Cannot modify status of a closed subscription")

    if new_status == "active":
        if old_status not in ["confirmed", "paused", "draft", "expired"]:
            raise ValueError(f"Cannot transition to 'active' from '{old_status}'")
        if old_status == "paused":
            sub.paused_at = None
            # Resuming: adjust next_billing_date starting from effective_date or today
            plan = db.query(Plan).filter(Plan.id == sub.plan_id).first()
            freq = plan.billing_frequency if plan else "monthly"
            base_date = effective_date or date.today()
            sub.next_billing_date = calculate_next_billing_date(base_date, freq)
        elif not sub.start_date:
            sub.start_date = effective_date or date.today()
            plan = db.query(Plan).filter(Plan.id == sub.plan_id).first()
            freq = plan.billing_frequency if plan else "monthly"
            sub.next_billing_date = calculate_next_billing_date(sub.start_date, freq)

    elif new_status == "paused":
        if old_status != "active":
            raise ValueError("Only active subscriptions can be paused")
        sub.paused_at = datetime.utcnow()

    elif new_status == "closed":
        sub.closed_at = datetime.utcnow()
        sub.close_reason = close_reason or notes or "Subscription terminated"
        sub.next_billing_date = None  # prevent future automated billing

    elif new_status == "confirmed":
        if old_status != "draft":
            raise ValueError("Only draft subscriptions can be confirmed")

    sub.status = new_status
    sub.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(sub)

    # Record event in audit history
    event_type = f"status_{new_status}"
    if new_status == "active" and old_status == "paused":
        event_type = "resumed"
    elif new_status == "active":
        event_type = "activated"
    elif new_status == "paused":
        event_type = "paused"
    elif new_status == "closed":
        event_type = "closed"
    elif new_status == "confirmed":
        event_type = "confirmed"

    record_subscription_event(
        db=db,
        subscription_id=sub.id,
        event_type=event_type,
        user_id=actor_user.id if actor_user else None,
        user_name=actor_user.name if actor_user else "System",
        previous_status=old_status,
        new_status=new_status,
        notes=close_reason or notes or f"Transitioned from {old_status} to {new_status}"
    )

    return sub

def renew_subscription(
    db: Session,
    sub_id: int,
    actor_user: Optional[User] = None,
    renewal_periods: int = 1,
    start_date: Optional[date] = None,
    notes: Optional[str] = None
) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise ValueError("Subscription not found")

    if sub.status == "closed":
        raise ValueError("Cannot renew a closed subscription")

    if sub.status == "draft":
        raise ValueError("Cannot renew an unconfirmed draft subscription")

    plan = db.query(Plan).filter(Plan.id == sub.plan_id).first()
    freq = plan.billing_frequency if plan else "monthly"

    old_end_date = sub.end_date
    base_date = start_date or sub.end_date or date.today()

    new_end_date = base_date
    for _ in range(max(1, renewal_periods)):
        new_end_date = calculate_next_billing_date(new_end_date, freq)

    sub.end_date = new_end_date
    sub.next_billing_date = calculate_next_billing_date(date.today(), freq)
    old_status = sub.status
    sub.status = "active"
    sub.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(sub)

    renewal_note = notes or f"Renewed for {renewal_periods} cycle(s). New end date: {new_end_date}"
    record_subscription_event(
        db=db,
        subscription_id=sub.id,
        event_type="renewed",
        user_id=actor_user.id if actor_user else None,
        user_name=actor_user.name if actor_user else "System",
        previous_status=old_status,
        new_status=sub.status,
        notes=renewal_note
    )

    return sub

def get_due_for_billing(db: Session) -> List[Subscription]:
    today = date.today()
    return db.query(Subscription).filter(
        Subscription.status == "active",
        Subscription.next_billing_date <= today
    ).all()

def get_subscription_history(db: Session, sub_id: int) -> List[SubscriptionHistory]:
    return db.query(SubscriptionHistory).filter(
        SubscriptionHistory.subscription_id == sub_id
    ).order_by(SubscriptionHistory.created_at.desc()).all()
