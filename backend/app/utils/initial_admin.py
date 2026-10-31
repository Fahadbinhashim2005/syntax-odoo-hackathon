import os

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.models.user import User
from app.schemas.user import validate_email
from app.utils.security import hash_password


DEVELOPMENT_ADMIN_EMAIL = "admin@yourcompany.com"
DEVELOPMENT_ADMIN_PASSWORD = "Admin@12345"


def seed_initial_admin(session_factory: sessionmaker) -> None:
    """Create the initial administrator once; never overwrite existing credentials."""
    with session_factory() as db:
        if db.scalar(select(User.id).where(User.role == "admin").limit(1)) is not None:
            return

        email = validate_email(os.getenv("INITIAL_ADMIN_EMAIL", DEVELOPMENT_ADMIN_EMAIL))
        password = os.getenv("INITIAL_ADMIN_PASSWORD")
        if not password:
            if os.getenv("APP_ENV", "development").lower() == "production":
                raise RuntimeError("Set INITIAL_ADMIN_PASSWORD before starting the production backend.")
            password = DEVELOPMENT_ADMIN_PASSWORD
        if len(password) < 8 or len(password) > 128:
            raise RuntimeError("INITIAL_ADMIN_PASSWORD must contain 8 to 128 characters.")

        if db.scalar(select(User.id).where(User.email == email)) is not None:
            raise RuntimeError("INITIAL_ADMIN_EMAIL is already used by a non-administrator account.")

        db.add(
            User(
                full_name=os.getenv("INITIAL_ADMIN_NAME", "Platform Administrator").strip() or "Platform Administrator",
                email=email,
                phone="",
                hashed_password=hash_password(password),
                role="admin",
                is_active=True,
                must_change_password=True,
            )
        )
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            # Another startup may have created the initial administrator first.
            if db.scalar(select(User.id).where(User.role == "admin").limit(1)) is None:
                raise
