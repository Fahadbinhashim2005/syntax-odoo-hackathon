from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.subscription import Subscription
from app.models.customer import Customer
from app.models.user import User
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionClose,
    SubscriptionPause,
    SubscriptionResume,
    SubscriptionRenew,
    SubscriptionHistoryOut,
    SubscriptionOut
)
from app.services.subscription_service import (
    create_subscription,
    update_subscription_status,
    renew_subscription,
    get_due_for_billing,
    get_subscription_history
)
from app.core.security import get_current_user

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("", response_model=List[SubscriptionOut])
def list_subscriptions(
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Subscription)

    # Customer role boundary: Can only list own subscriptions
    if current_user.role == "customer":
        cust = db.query(Customer).filter(
            (Customer.email == current_user.email) | (Customer.user_id == current_user.id)
        ).first()
        if cust:
            query = query.filter(Subscription.customer_id == cust.id)
        else:
            return []
    else:
        if isinstance(customer_id, int):
            query = query.filter(Subscription.customer_id == customer_id)

    if isinstance(status, str) and status and status != "all":
        query = query.filter(Subscription.status == status.lower())

    if isinstance(from_date, (date, datetime)):
        query = query.filter(Subscription.start_date >= from_date)
    if isinstance(to_date, (date, datetime)):
        query = query.filter(Subscription.start_date <= to_date)

    if isinstance(search, str) and search.strip():
        term = search.strip()
        query = query.filter(
            (Subscription.subscription_number.ilike(f"%{term}%")) |
            (Subscription.customer.has(Customer.name.ilike(f"%{term}%"))) |
            (Subscription.customer.has(Customer.company.ilike(f"%{term}%")))
        )

    return query.order_by(Subscription.created_at.desc()).all()

@router.get("/due-for-billing", response_model=List[SubscriptionOut])
def list_due_for_billing(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_due_for_billing(db)

@router.post("", response_model=SubscriptionOut)
def create_new_subscription(
    req: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Customers cannot directly instantiate subscriptions")

    data = req.model_dump()
    try:
        return create_subscription(db, data, actor_user=current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{sub_id}", response_model=SubscriptionOut)
def get_subscription(
    sub_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if current_user.role == "customer":
        if sub.customer.email != current_user.email and sub.customer.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return sub

@router.get("/{sub_id}/history", response_model=List[SubscriptionHistoryOut])
def list_subscription_history(
    sub_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if current_user.role == "customer":
        if sub.customer.email != current_user.email and sub.customer.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return get_subscription_history(db, sub_id)

@router.put("/{sub_id}", response_model=SubscriptionOut)
def update_subscription(
    sub_id: int,
    req: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")

    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if req.quantity is not None:
        sub.quantity = max(1, req.quantity)
    if req.unit_price is not None:
        sub.unit_price = max(0.0, req.unit_price)
    if req.discount_amount is not None:
        sub.discount_amount = max(0.0, req.discount_amount)
    if req.tax_amount is not None:
        sub.tax_amount = max(0.0, req.tax_amount)
    if req.status is not None:
        sub.status = req.status
    if req.start_date is not None:
        sub.start_date = req.start_date
    if req.end_date is not None:
        sub.end_date = req.end_date
    if req.next_billing_date is not None:
        sub.next_billing_date = req.next_billing_date
    if req.close_reason is not None:
        sub.close_reason = req.close_reason

    subtotal = sub.unit_price * sub.quantity
    sub.total_amount = max(0.0, subtotal - sub.discount_amount + sub.tax_amount)
    sub.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sub)
    return sub

@router.post("/{sub_id}/confirm", response_model=SubscriptionOut)
def confirm_sub(sub_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    try:
        return update_subscription_status(db, sub_id, "confirmed", actor_user=current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{sub_id}/activate", response_model=SubscriptionOut)
def activate_sub(sub_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    try:
        return update_subscription_status(db, sub_id, "active", actor_user=current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{sub_id}/pause", response_model=SubscriptionOut)
def pause_sub(
    sub_id: int,
    req: Optional[SubscriptionPause] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    reason = req.reason if req else "Admin requested pause"
    try:
        return update_subscription_status(db, sub_id, "paused", actor_user=current_user, notes=reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{sub_id}/resume", response_model=SubscriptionOut)
def resume_sub(
    sub_id: int,
    req: Optional[SubscriptionResume] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    effective_date = req.effective_date if req else None
    try:
        return update_subscription_status(db, sub_id, "active", actor_user=current_user, effective_date=effective_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{sub_id}/renew", response_model=SubscriptionOut)
def renew_sub(
    sub_id: int,
    req: Optional[SubscriptionRenew] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    periods = req.renewal_periods if req and req.renewal_periods else 1
    start_date = req.start_date if req else None
    try:
        return renew_subscription(db, sub_id, actor_user=current_user, renewal_periods=periods, start_date=start_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{sub_id}/close", response_model=SubscriptionOut)
def close_sub(
    sub_id: int,
    req: Optional[SubscriptionClose] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    reason = req.close_reason if req and req.close_reason else "Customer requested termination"
    try:
        return update_subscription_status(db, sub_id, "closed", actor_user=current_user, close_reason=reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
