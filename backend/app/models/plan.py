from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    billing_frequency = Column(String, default="monthly")  # daily, weekly, monthly, yearly
    price = Column(Float, default=0.0)
    min_quantity = Column(Integer, default=1)
    available_from = Column(Date, nullable=True)
    available_to = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="plans")
