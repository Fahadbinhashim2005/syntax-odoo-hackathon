from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.subscription import Subscription

def get_finance_stats(db: Session) -> dict:
    today = date.today()
    
    # Check overdue status for invoices
    overdue_invoices = db.query(Invoice).filter(
        Invoice.due_date < today,
        Invoice.status.in_(["confirmed", "partially_paid"])
    ).all()
    for inv in overdue_invoices:
        inv.status = "overdue"
    if overdue_invoices:
        db.commit()
    
    # Sum paid invoices revenue
    total_rev_result = db.query(func.sum(Payment.amount)).scalar()
    total_revenue = float(total_rev_result or 0.0)
    
    # Sum outstanding
    invoices = db.query(Invoice).filter(Invoice.status.notin_(["cancelled", "draft"])).all()
    outstanding = sum(inv.outstanding_amount for inv in invoices)
    
    invoices_paid = db.query(Invoice).filter(Invoice.status == "paid").count()
    overdue_count = db.query(Invoice).filter(Invoice.status == "overdue").count()
    active_subscriptions = db.query(Subscription).filter(Subscription.status == "active").count()
    
    # Monthly revenue for last 6 months
    monthly_revenue = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i in range(5, -1, -1):
        # approximate month offset
        calc_date = today - timedelta(days=i * 30)
        m_name = f"{month_names[calc_date.month - 1]} {calc_date.year}"
        
        # calculate sum of payments in this year and month
        rev = db.query(func.sum(Payment.amount)).filter(
            func.strftime('%Y-%m', Payment.payment_date) == calc_date.strftime('%Y-%m')
        ).scalar() or 0.0
        
        monthly_revenue.append({
            "month": m_name,
            "revenue": float(rev)
        })
        
    # Invoice status distribution
    dist = {
        "Paid": db.query(Invoice).filter(Invoice.status == "paid").count(),
        "Pending": db.query(Invoice).filter(Invoice.status.in_(["confirmed", "partially_paid"])).count(),
        "Overdue": db.query(Invoice).filter(Invoice.status == "overdue").count(),
        "Draft": db.query(Invoice).filter(Invoice.status == "draft").count(),
    }
    
    return {
        "total_revenue": total_revenue,
        "outstanding": outstanding,
        "invoices_paid": invoices_paid,
        "overdue_count": overdue_count,
        "active_subscriptions": active_subscriptions,
        "monthly_revenue": monthly_revenue,
        "invoice_distribution": dist
    }

def get_revenue_report(db: Session, from_date: date = None, to_date: date = None):
    query = db.query(Payment)
    if from_date:
        query = query.filter(Payment.payment_date >= from_date)
    if to_date:
        query = query.filter(Payment.payment_date <= to_date)
        
    payments = query.all()
    total_collected = sum(p.amount for p in payments)
    
    # Aggregate by payment method
    methods = {}
    for p in payments:
        m = (p.payment_method or "other").upper()
        methods[m] = methods.get(m, 0.0) + p.amount
        
    return {
        "total_collected": total_collected,
        "payment_count": len(payments),
        "by_method": [{"method": k, "amount": v} for k, v in methods.items()]
    }
