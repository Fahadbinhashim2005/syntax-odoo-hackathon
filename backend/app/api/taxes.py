from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.tax import Tax
from app.models.user import User
from app.schemas.tax import TaxCreate, TaxUpdate, TaxOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api/taxes", tags=["Taxes"])

@router.get("", response_model=List[TaxOut])
def list_taxes(db: Session = Depends(get_db)):
    return db.query(Tax).order_by(Tax.percentage.asc()).all()

@router.post("", response_model=TaxOut)
def create_tax(req: TaxCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tax = Tax(
        name=req.name,
        percentage=req.percentage,
        is_active=req.is_active
    )
    db.add(tax)
    db.commit()
    db.refresh(tax)
    return tax

@router.put("/{tax_id}", response_model=TaxOut)
def update_tax(
    tax_id: int,
    req: TaxUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tax = db.query(Tax).filter(Tax.id == tax_id).first()
    if not tax:
        raise HTTPException(status_code=404, detail="Tax not found")
        
    if req.name is not None:
        tax.name = req.name
    if req.percentage is not None:
        tax.percentage = req.percentage
    if req.is_active is not None:
        tax.is_active = req.is_active
        
    db.commit()
    db.refresh(tax)
    return tax
