import hashlib
import os
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    ForgotPassword,
    LoginRequest,
    PasswordChange,
    RegisterRequest,
    ResetPassword,
    TokenResponse,
    UserResponse,
)
from app.utils.dependencies import get_current_user
from app.utils.security import create_access_token, hash_password, password_hasher, verify_password


router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone.strip(),
        hashed_password=hash_password(payload.password),
        role="customer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect.")
    if user.role not in {"admin", "staff", "customer", "developer_team"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has no valid access role.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is deactivated.")
    return {"access_token": create_access_token(user.id), "user": user}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPassword, db: Session = Depends(get_db)):
    generic_message = {
        "message": "If an active account matches that email and email delivery is configured, reset instructions will be sent."
    }
    user = db.scalar(select(User).where(User.email == payload.email, User.is_active.is_(True)))
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM")
    if user is None or not all((smtp_host, smtp_user, smtp_password, sender)):
        return generic_message

    reset_token = secrets.token_urlsafe(32)
    user.reset_token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    db.commit()

    message = EmailMessage()
    message["Subject"] = "Reset your Brightloop password"
    message["From"] = sender
    message["To"] = user.email
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_path = "/admin/reset-password" if user.role == "admin" else "/customer/reset-password" if user.role == "customer" else "/developer/reset-password" if user.role == "developer_team" else "/reset-password"
    message.set_content(
        f"Use this link within 30 minutes to reset your password:\n"
        f"{frontend_url.rstrip('/')}{reset_path}?token={reset_token}\n"
        "If you did not request this, you can ignore this email."
    )
    try:
        with smtplib.SMTP_SSL(smtp_host, int(os.getenv("SMTP_PORT", "465")), timeout=10) as smtp:
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException, ValueError) as exc:
        user.reset_token_hash = None
        user.reset_token_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Password reset email could not be sent. Please try again later.",
        ) from exc
    return generic_message


@router.post("/reset-password")
def reset_password(payload: ResetPassword, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    user = db.scalar(select(User).where(User.reset_token_hash == token_hash))
    if user is None or user.reset_token_expires_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link is invalid or expired.")
    expires_at = user.reset_token_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link is invalid or expired.")
    user.hashed_password = hash_password(payload.new_password)
    user.must_change_password = False
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    db.commit()
    return {"message": "Password updated. You can now sign in."}


@router.post("/change-password")
def change_password(
    payload: PasswordChange,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
    if user.must_change_password and verify_password(payload.new_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Choose a password different from the temporary password.")
    user.hashed_password = hash_password(payload.new_password)
    user.must_change_password = False
    db.commit()
    return {"message": "Password updated successfully."}
