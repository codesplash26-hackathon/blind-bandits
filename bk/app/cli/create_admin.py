import argparse
import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.auth import RegistrationRequest


def create_admin(name: str, email: str, password: str) -> User:
    validated = RegistrationRequest(name=name, email=email, password=password)
    with SessionLocal() as db:
        existing_user = db.scalar(select(User).where(User.email == validated.email))
        if existing_user is not None:
            raise ValueError("A user with this email already exists")
        user = User(
            name=validated.name,
            email=validated.email,
            password_hash=hash_password(validated.password),
            role=UserRole.ADMIN,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the initial admin account")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    password = getpass.getpass("Password: ")
    confirmation = getpass.getpass("Confirm password: ")
    if password != confirmation:
        parser.error("Passwords do not match")

    try:
        user = create_admin(args.name, args.email, password)
    except ValueError as exc:
        parser.error(str(exc))
    print(f"Created admin user {user.email}")


if __name__ == "__main__":
    main()
