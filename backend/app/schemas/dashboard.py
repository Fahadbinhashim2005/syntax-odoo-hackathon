from pydantic import BaseModel
from typing import List, Dict, Any

class MonthlyRevenueItem(BaseModel):
    month: str
    revenue: float

class FinanceStats(BaseModel):
    total_revenue: float
    outstanding: float
    invoices_paid: int
    overdue_count: int
    active_subscriptions: int
    monthly_revenue: List[MonthlyRevenueItem]
    invoice_distribution: Dict[str, int]
