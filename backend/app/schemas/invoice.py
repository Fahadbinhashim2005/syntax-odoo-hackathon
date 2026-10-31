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
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InvoiceItemCreate(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal = Field(ge=0)


class InvoiceCreate(BaseModel):
    customer_id: int = Field(gt=0)
    due_date: date
    discount_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax_rate: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)
    items: list[InvoiceItemCreate] = Field(min_length=1)


class InvoiceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    customer_id: int
    issue_date: date
    due_date: date
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    outstanding_amount: Decimal
    status: str
    created_at: datetime
    items: list[InvoiceItemResponse]
