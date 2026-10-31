from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: DbSession,
    request: Request,
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    try:
        user_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This account is unavailable.")
    if user.role not in {"admin", "staff", "customer", "developer_team"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has no valid access role.")
    password_change_request = request.url.path == "/api/auth/change-password" and request.method == "POST"
    profile_bootstrap_request = request.url.path == "/api/users/me" and request.method == "GET"
    if user.must_change_password and not (password_change_request or profile_bootstrap_request):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Change your temporary password before continuing.")
    return user


def require_roles(*roles: str):
    def check_role(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission.")
        return user

    return check_role
