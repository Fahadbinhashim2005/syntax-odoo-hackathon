from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date
from datetime import datetime
from app.database import Base

class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    discount_type = Column(String, default="percentage")  # percentage, fixed
    value = Column(Float, default=0.0)
    applicable_to = Column(String, default="all")  # all, plan, product
    applicable_id = Column(Integer, nullable=True)
    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
