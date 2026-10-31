import os
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError


SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("APP_ENV", "development").lower() == "production":
        raise RuntimeError("SECRET_KEY must be configured in production.")
    SECRET_KEY = "local-development-secret-change-before-deployment"

ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "60"))
password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return password_hasher.verify(hashed_password, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expires_at}, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject.isdigit():
        raise jwt.InvalidTokenError("Invalid user identifier.")
    return int(subject)
