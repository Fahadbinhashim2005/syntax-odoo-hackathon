from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.schemas.customer import CustomerOut

class PaymentCreate(BaseModel):
    invoice_id: int
    customer_id: Optional[int] = None
    amount: float
    payment_date: Optional[date] = None
    payment_method: str = "upi"  # cash, bank_transfer, card, upi, other
    reference: Optional[str] = None
    notes: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    payment_number: str
    invoice_id: int
    customer_id: int
    amount: float
    payment_date: date
    payment_method: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    customer: Optional[CustomerOut] = None

    class Config:
        from_attributes = True
