from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.schemas.customer import CustomerOut
from app.schemas.plan import PlanOut

class SubscriptionCreate(BaseModel):
    customer_id: int
    plan_id: int
    quotation_id: Optional[int] = None
    quantity: int = 1
    unit_price: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    start_date: date
    end_date: Optional[date] = None
    next_billing_date: Optional[date] = None

class SubscriptionUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    discount_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    next_billing_date: Optional[date] = None
    close_reason: Optional[str] = None

class SubscriptionClose(BaseModel):
    close_reason: Optional[str] = "Customer requested termination"

class SubscriptionPause(BaseModel):
    reason: Optional[str] = "Customer requested temporary pause"

class SubscriptionResume(BaseModel):
    effective_date: Optional[date] = None

class SubscriptionRenew(BaseModel):
    renewal_periods: Optional[int] = 1
    start_date: Optional[date] = None

class QuotationConvertRequest(BaseModel):
    start_date: Optional[date] = None
    billing_frequency: Optional[str] = None
    notes: Optional[str] = None

class SubscriptionHistoryOut(BaseModel):
    id: int
    subscription_id: int
    event_type: str
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionOut(BaseModel):
    id: int
    subscription_number: str
    customer_id: int
    plan_id: int
    quotation_id: Optional[int] = None
    quantity: int
    unit_price: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    status: str
    start_date: date
    end_date: Optional[date] = None
    next_billing_date: Optional[date] = None
    paused_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    close_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerOut] = None
    plan: Optional[PlanOut] = None
    history: Optional[List[SubscriptionHistoryOut]] = []

    class Config:
        from_attributes = True
