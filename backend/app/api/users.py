from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserOut, UserCreate, StaffUpdate
from app.core.security import require_admin, hash_password

router = APIRouter(prefix="/api/staff", tags=["Staff Management"])

@router.get("", response_model=List[UserOut])
def list_staff(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role.in_(["admin", "staff"])).order_by(User.created_at.desc()).all()

@router.post("", response_model=UserOut)
def create_staff(req: UserCreate, admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    role = req.role if req.role in ["admin", "staff"] else "staff"
    user = User(
        name=req.name,
        email=req.email.lower(),
        hashed_password=hash_password(req.password),
        role=role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_staff(user_id: int, req: StaffUpdate, admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff user not found")
        
    if req.name is not None:
        user.name = req.name
    if req.email is not None:
        user.email = req.email.lower()
    if req.role is not None and req.role in ["admin", "staff"]:
        user.role = req.role
    if req.is_active is not None:
        user.is_active = req.is_active
        
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/deactivate", response_model=UserOut)
def toggle_staff_status(user_id: int, admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff user not found")
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
        
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
