from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.schemas.customer import CustomerOut
from app.schemas.plan import PlanOut
from app.schemas.product import ProductOut

class QuotationCreate(BaseModel):
    customer_id: int
    plan_id: int
    product_id: Optional[int] = None
    quantity: int = 1
    unit_price: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    status: Optional[str] = "draft"
    valid_until: Optional[date] = None
    notes: Optional[str] = None

class QuotationUpdate(BaseModel):
    customer_id: Optional[int] = None
    plan_id: Optional[int] = None
    product_id: Optional[int] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    discount_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    status: Optional[str] = None
    valid_until: Optional[date] = None
    notes: Optional[str] = None

class QuotationAction(BaseModel):
    reason: Optional[str] = None

class QuotationAction(BaseModel):
    reason: Optional[str] = None

class QuotationOut(BaseModel):
    id: int
    quotation_number: str
    customer_id: int
    plan_id: int
    product_id: Optional[int] = None
    quantity: int
    unit_price: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    status: str
    valid_until: Optional[date] = None
    notes: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    subscription_id: Optional[int] = None
    subscription_number: Optional[str] = None
    customer: Optional[CustomerOut] = None
    plan: Optional[PlanOut] = None
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True
