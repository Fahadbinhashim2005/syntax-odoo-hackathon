from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.schemas.product import ProductOut

class PlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    product_id: int
    billing_frequency: str = "monthly"  # daily, weekly, monthly, yearly
    price: float = 0.0
    min_quantity: int = 1
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    is_active: bool = True

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    product_id: Optional[int] = None
    billing_frequency: Optional[str] = None
    price: Optional[float] = None
    min_quantity: Optional[int] = None
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    is_active: Optional[bool] = None

class PlanOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    product_id: int
    billing_frequency: str
    price: float
    min_quantity: int
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    is_active: bool
    created_at: datetime
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True
