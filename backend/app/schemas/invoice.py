from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.schemas.customer import CustomerOut
from app.schemas.subscription import SubscriptionOut
from app.schemas.payment import PaymentOut

class InvoiceCreate(BaseModel):
    subscription_id: Optional[int] = None
    customer_id: int
    issue_date: date
    due_date: date
    subtotal: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    total_amount: float
    notes: Optional[str] = None

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    subscription_id: Optional[int] = None
    customer_id: int
    issue_date: date
    due_date: date
    subtotal: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    paid_amount: float
    outstanding_amount: float
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerOut] = None
    subscription: Optional[SubscriptionOut] = None
    payments: List[PaymentOut] = []

    class Config:
        from_attributes = True
