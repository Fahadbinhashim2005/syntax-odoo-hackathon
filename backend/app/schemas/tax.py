from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaxCreate(BaseModel):
    name: str
    percentage: float
    is_active: bool = True

class TaxUpdate(BaseModel):
    name: Optional[str] = None
    percentage: Optional[float] = None
    is_active: Optional[bool] = None

class TaxOut(BaseModel):
    id: int
    name: str
    percentage: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
