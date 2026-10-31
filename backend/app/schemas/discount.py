from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class DiscountCreate(BaseModel):
    name: str
    discount_type: str = "percentage"  # percentage, fixed
    value: float = 0.0
    applicable_to: str = "all"  # all, plan, product
    applicable_id: Optional[int] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    is_active: bool = True

class DiscountUpdate(BaseModel):
    name: Optional[str] = None
    discount_type: Optional[str] = None
    value: Optional[float] = None
    applicable_to: Optional[str] = None
    applicable_id: Optional[int] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    is_active: Optional[bool] = None

class DiscountOut(BaseModel):
    id: int
    name: str
    discount_type: str
    value: float
    applicable_to: str
    applicable_id: Optional[int] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
