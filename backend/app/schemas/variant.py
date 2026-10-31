from pydantic import BaseModel
from typing import Optional

class VariantCreate(BaseModel):
    name: str
    additional_price: float = 0.0
    is_active: bool = True

class VariantUpdate(BaseModel):
    name: Optional[str] = None
    additional_price: Optional[float] = None
    is_active: Optional[bool] = None

class VariantOut(BaseModel):
    id: int
    product_id: int
    name: str
    additional_price: float
    is_active: bool

    class Config:
        from_attributes = True
