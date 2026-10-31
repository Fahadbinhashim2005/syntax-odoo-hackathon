from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.variant import VariantOut

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    product_type: str = "service"  # service, consumable, storable
    sales_price: float = 0.0
    cost_price: float = 0.0
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    product_type: Optional[str] = None
    sales_price: Optional[float] = None
    cost_price: Optional[float] = None
    is_active: Optional[bool] = None

class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    product_type: str
    sales_price: float
    cost_price: float
    is_active: bool
    created_at: datetime
    variants: List[VariantOut] = []

    class Config:
        from_attributes = True
