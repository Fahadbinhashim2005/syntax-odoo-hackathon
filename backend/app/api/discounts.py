from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.discount import Discount
from app.models.user import User
from app.schemas.discount import DiscountCreate, DiscountUpdate, DiscountOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api/discounts", tags=["Discounts"])

@router.get("", response_model=List[DiscountOut])
def list_discounts(db: Session = Depends(get_db)):
    return db.query(Discount).order_by(Discount.created_at.desc()).all()

@router.post("", response_model=DiscountOut)
def create_discount(req: DiscountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    discount = Discount(
        name=req.name,
        discount_type=req.discount_type,
        value=req.value,
        applicable_to=req.applicable_to,
        applicable_id=req.applicable_id,
        valid_from=req.valid_from,
        valid_to=req.valid_to,
        is_active=req.is_active
    )
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount

@router.put("/{discount_id}", response_model=DiscountOut)
def update_discount(
    discount_id: int,
    req: DiscountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
        
    if req.name is not None:
        discount.name = req.name
    if req.discount_type is not None:
        discount.discount_type = req.discount_type
    if req.value is not None:
        discount.value = req.value
    if req.applicable_to is not None:
        discount.applicable_to = req.applicable_to
    if req.applicable_id is not None:
        discount.applicable_id = req.applicable_id
    if req.valid_from is not None:
        discount.valid_from = req.valid_from
    if req.valid_to is not None:
        discount.valid_to = req.valid_to
    if req.is_active is not None:
        discount.is_active = req.is_active
        
    db.commit()
    db.refresh(discount)
    return discount

@router.delete("/{discount_id}")
def delete_discount(discount_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")
    discount.is_active = False
    db.commit()
    return {"message": "Discount deactivated successfully"}
