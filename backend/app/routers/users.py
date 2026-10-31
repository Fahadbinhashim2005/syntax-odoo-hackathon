from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import DeveloperCreate, StatusUpdate, UserCreate, UserResponse, UserUpdate
from app.utils.dependencies import get_current_user, require_roles
from app.utils.security import hash_password


router = APIRouter(prefix="/api", tags=["users"])


@router.get("/users/me", response_model=UserResponse)
def get_my_profile(user: User = Depends(get_current_user)):
    return user


@router.put("/users/me", response_model=UserResponse)
def update_my_profile(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=list[UserResponse])
def list_staff(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    return db.scalars(select(User).where(User.role == "staff").order_by(User.created_at.desc())).all()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_staff(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    if payload.role != "staff":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Staff accounts must use the staff role.")
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        hashed_password=hash_password(payload.password),
        role="staff",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/developers",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Provision a Developer Team account",
    description="Administrator-only provisioning. The assigned role is always developer_team.",
)
def create_developer(
    payload: DeveloperCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    developer = User(
        full_name=payload.full_name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        hashed_password=hash_password(payload.password),
        role="developer_team",
        is_active=True,
    )
    db.add(developer)
    db.commit()
    db.refresh(developer)
    return developer


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin" and user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view your own profile.")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.role == "admin" and target.role != "staff" and target.id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return target


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin" and user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own profile.")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if target.role == "admin" and target.id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot edit another administrator.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(target, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(target)
    return target


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    payload: StatusUpdate,
    user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    target = db.get(User, user_id)
    if target is None or target.role != "staff":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found.")
    if target.id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own account.")
    target.is_active = payload.is_active
    db.commit()
    db.refresh(target)
    return target


@router.get("/customers", response_model=list[UserResponse])
def list_customers(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    return db.scalars(select(User).where(User.role == "customer").order_by(User.created_at.desc())).all()


@router.post("/customers", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    customer = User(
        full_name=payload.full_name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        company_name=payload.company_name,
        address=payload.address,
        hashed_password=hash_password(payload.password),
        role="customer",
        is_active=True,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/customers/{customer_id}", response_model=UserResponse)
def get_customer(
    customer_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin" and not (user.role == "customer" and user.id == customer_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view your own profile.")
    customer = db.get(User, customer_id)
    if customer is None or customer.role != "customer":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return customer


@router.put("/customers/{customer_id}", response_model=UserResponse)
def update_customer(
    customer_id: int,
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin" and not (user.role == "customer" and user.id == customer_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own profile.")
    customer = db.get(User, customer_id)
    if customer is None or customer.role != "customer":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(customer)
    return customer


@router.patch("/customers/{customer_id}/status", response_model=UserResponse)
def update_customer_status(
    customer_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    customer = db.get(User, customer_id)
    if customer is None or customer.role != "customer":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    customer.is_active = payload.is_active
    db.commit()
    db.refresh(customer)
    return customer
