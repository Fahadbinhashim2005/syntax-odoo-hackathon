from getpass import getpass

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.schemas.user import validate_email
from app.utils.security import hash_password


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(User.id).where(User.role == "admin").limit(1)) is not None:
            raise SystemExit("An administrator already exists.")

        full_name = input("Administrator name: ").strip()
        if len(full_name) < 2:
            raise SystemExit("Name must contain at least two characters.")
        try:
            email = validate_email(input("Administrator email: "))
        except ValueError as exc:
            raise SystemExit(str(exc)) from exc

        password = getpass("Password (at least 8 characters): ")
        if len(password) < 8 or len(password) > 128:
            raise SystemExit("Password must contain 8 to 128 characters.")
        if password != getpass("Confirm password: "):
            raise SystemExit("Passwords do not match.")

        db.add(
            User(
                full_name=full_name,
                email=email,
                phone="",
                hashed_password=hash_password(password),
                role="admin",
                is_active=True,
            )
        )
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SystemExit("That email is already in use.") from exc
    print("Administrator account created. You can now sign in.")


if __name__ == "__main__":
    main()
