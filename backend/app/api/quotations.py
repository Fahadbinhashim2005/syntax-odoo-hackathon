from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.quotation import Quotation
from app.models.customer import Customer
from app.models.user import User
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationOut, QuotationAction
from app.schemas.subscription import SubscriptionOut, QuotationConvertRequest
from app.services.quotation_service import create_quotation, confirm_quotation
from app.core.security import get_current_user

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])

@router.get("", response_model=List[QuotationOut])
def list_quotations(
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Quotation)

    # Customer access boundary: Customers can only access their own quotations
    if current_user.role == "customer":
        cust = db.query(Customer).filter(
            (Customer.email == current_user.email) | (Customer.user_id == current_user.id)
        ).first()
        if cust:
            query = query.filter(Quotation.customer_id == cust.id)
        else:
            return []
    else:
        if isinstance(customer_id, int):
            query = query.filter(Quotation.customer_id == customer_id)

    if isinstance(status, str) and status and status != "all":
        if status.lower() == "expired":
            query = query.filter(Quotation.valid_until < date.today(), Quotation.status.notin_(["converted", "cancelled"]))
        else:
            query = query.filter(Quotation.status == status.lower())
    
    if isinstance(from_date, (date, datetime)):
        query = query.filter(Quotation.created_at >= datetime.combine(from_date, datetime.min.time()))
    if isinstance(to_date, (date, datetime)):
        query = query.filter(Quotation.created_at <= datetime.combine(to_date, datetime.max.time()))

    if isinstance(search, str) and search.strip():
        term = search.strip()
        query = query.filter(
            (Quotation.quotation_number.ilike(f"%{term}%")) |
            (Quotation.customer.has(Customer.name.ilike(f"%{term}%"))) |
            (Quotation.customer.has(Customer.company.ilike(f"%{term}%")))
        )

    return query.order_by(Quotation.created_at.desc()).all()

@router.post("", response_model=QuotationOut)
def create_new_quotation(
    req: QuotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customers cannot create formal quotations"
        )
    try:
        return create_quotation(db, req, created_by=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{quotation_id}", response_model=QuotationOut)
def get_quotation(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Security check: Customer can only view their own quotation
    if current_user.role == "customer":
        if quotation.customer.email != current_user.email and quotation.customer.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this quotation document")

    return quotation

@router.put("/{quotation_id}", response_model=QuotationOut)
def update_quotation(
    quotation_id: int,
    req: QuotationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")

    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quotation.status not in ["draft", "sent"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot edit quotation in '{quotation.status}' status. Only draft and sent quotes can be modified."
        )

    if req.customer_id is not None:
        quotation.customer_id = req.customer_id
    if req.plan_id is not None:
        quotation.plan_id = req.plan_id
    if req.product_id is not None:
        quotation.product_id = req.product_id
    if req.quantity is not None:
        quotation.quantity = max(1, req.quantity)
    if req.unit_price is not None:
        quotation.unit_price = max(0.0, req.unit_price)
    if req.discount_amount is not None:
        quotation.discount_amount = max(0.0, req.discount_amount)
    if req.tax_amount is not None:
        quotation.tax_amount = max(0.0, req.tax_amount)
    if req.status is not None:
        quotation.status = req.status
    if req.valid_until is not None:
        quotation.valid_until = req.valid_until
    if req.notes is not None:
        quotation.notes = req.notes

    subtotal = quotation.unit_price * quotation.quantity
    quotation.total_amount = max(0.0, subtotal - quotation.discount_amount + quotation.tax_amount)
    quotation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(quotation)
    return quotation

@router.delete("/{quotation_id}")
def cancel_quotation(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")

    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quotation.status in ["accepted", "converted"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an already converted quotation")

    quotation.status = "cancelled"
    quotation.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Quotation successfully cancelled"}

@router.post("/{quotation_id}/send", response_model=QuotationOut)
def send_quotation(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Permission denied")
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quotation.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft quotations can be marked as sent")
    quotation.status = "sent"
    quotation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(quotation)
    return quotation

@router.post("/{quotation_id}/accept", response_model=QuotationOut)
def accept_quotation(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quotation.status not in ["draft", "sent"]:
        raise HTTPException(status_code=400, detail=f"Cannot accept quotation in '{quotation.status}' state")
    quotation.status = "accepted"
    quotation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(quotation)
    return quotation

@router.post("/{quotation_id}/reject", response_model=QuotationOut)
def reject_quotation(
    quotation_id: int,
    req: Optional[QuotationAction] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quotation.status in ["converted"]:
        raise HTTPException(status_code=400, detail="Cannot reject an already converted quotation")
    quotation.status = "rejected"
    if req and req.reason:
        existing_notes = quotation.notes or ""
        quotation.notes = f"{existing_notes}\n[Rejected reason: {req.reason}]".strip()
    quotation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(quotation)
    return quotation

@router.post("/{quotation_id}/convert", response_model=SubscriptionOut)
@router.post("/{quotation_id}/confirm", response_model=SubscriptionOut)
def confirm_and_create_sub(
    quotation_id: int,
    req: Optional[QuotationConvertRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Only staff and admin can convert quotations to subscriptions")

    start_date = req.start_date if req else None
    notes = req.notes if req else None

    try:
        subscription = confirm_quotation(
            db=db,
            quotation_id=quotation_id,
            actor_user=current_user,
            start_date=start_date,
            notes=notes
        )
        return subscription
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
