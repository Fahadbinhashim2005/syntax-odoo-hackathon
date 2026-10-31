from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.plan import Plan
from app.models.product import Product
from app.models.user import User
from app.schemas.plan import PlanCreate, PlanUpdate, PlanOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api/plans", tags=["Subscription Plans"])

@router.get("", response_model=List[PlanOut])
def list_plans(
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    billing_frequency: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Plan)
    if search:
        query = query.filter(Plan.name.ilike(f"%{search}%"))
    if is_active is not None:
        query = query.filter(Plan.is_active == is_active)
    if billing_frequency:
        query = query.filter(Plan.billing_frequency == billing_frequency.lower())
        
    return query.order_by(Plan.price.asc()).all()

@router.post("", response_model=PlanOut)
def create_plan(req: PlanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=400, detail="Linked product not found")
        
    plan = Plan(
        name=req.name,
        description=req.description,
        product_id=req.product_id,
        billing_frequency=req.billing_frequency,
        price=req.price,
        min_quantity=req.min_quantity,
        available_from=req.available_from,
        available_to=req.available_to,
        is_active=req.is_active
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(
    plan_id: int,
    req: PlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    if req.name is not None:
        plan.name = req.name
    if req.description is not None:
        plan.description = req.description
    if req.product_id is not None:
        plan.product_id = req.product_id
    if req.billing_frequency is not None:
        plan.billing_frequency = req.billing_frequency
    if req.price is not None:
        plan.price = req.price
    if req.min_quantity is not None:
        plan.min_quantity = req.min_quantity
    if req.available_from is not None:
        plan.available_from = req.available_from
    if req.available_to is not None:
        plan.available_to = req.available_to
    if req.is_active is not None:
        plan.is_active = req.is_active
        
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.is_active = False
    db.commit()
    return {"message": "Plan deactivated successfully"}
