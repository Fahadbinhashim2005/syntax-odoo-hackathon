from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api/customers", tags=["Customer Management"])

@router.get("", response_model=List[CustomerOut])
def list_customers(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    
    if current_user.role == "customer":
        query = query.filter(Customer.email == current_user.email)
    else:
        if search:
            query = query.filter(
                (Customer.name.ilike(f"%{search}%")) |
                (Customer.email.ilike(f"%{search}%")) |
                (Customer.company.ilike(f"%{search}%"))
            )
        if status == "active":
            query = query.filter(Customer.is_active == True)
        elif status == "inactive":
            query = query.filter(Customer.is_active == False)
            
    return query.order_by(Customer.created_at.desc()).all()

@router.post("", response_model=CustomerOut)
def create_customer(
    req: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Customer).filter(Customer.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
        
    customer = Customer(
        name=req.name,
        email=req.email.lower(),
        phone=req.phone,
        company=req.company,
        address=req.address,
        is_active=True
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if current_user.role == "customer" and customer.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    return customer

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    req: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    if req.name is not None:
        customer.name = req.name
    if req.email is not None:
        customer.email = req.email.lower()
    if req.phone is not None:
        customer.phone = req.phone
    if req.company is not None:
        customer.company = req.company
    if req.address is not None:
        customer.address = req.address
    if req.is_active is not None:
        customer.is_active = req.is_active
        
    db.commit()
    db.refresh(customer)
    return customer

@router.patch("/{customer_id}/deactivate", response_model=CustomerOut)
def toggle_customer_status(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    customer.is_active = not customer.is_active
    db.commit()
    db.refresh(customer)
    return customer
