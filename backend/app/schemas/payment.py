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
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    invoice_id: int = Field(gt=0)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    payment_method: str = Field(min_length=1, max_length=50)
    transaction_reference: str | None = Field(
        default=None,
        max_length=100,
    )


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_id: int
    amount: Decimal
    payment_method: str
    transaction_reference: str | None
    payment_date: datetime
    status: str
