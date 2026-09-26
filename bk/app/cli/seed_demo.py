import argparse
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.auth import RegistrationRequest
from app.schemas.destination import DestinationCreate
from app.services.destinations import create_destination, find_destination_by_slug

from .seed_destinations import load_seed_file

DEFAULT_ADMIN_NAME = "CeylonTour Demo Admin"
DEFAULT_ADMIN_EMAIL = "admin@ceylontour.demo"
DEFAULT_ADMIN_PASSWORD = "CeylonTourDemo2026!"
DEFAULT_DESTINATION_FILE = (
    Path(__file__).resolve().parents[3] / "data" / "demo" / "destinations.json"
)


@dataclass(frozen=True)
class DemoSeedResult:
    admin_created: bool
    destinations_created: int
    destinations_skipped: int


def seed_demo(
    *,
    admin_name: str,
    admin_email: str,
    admin_password: str,
    destinations: list[DestinationCreate],
) -> DemoSeedResult:
    """Create a predictable demo admin and add any missing demo destinations."""
    validated_admin = RegistrationRequest(
        name=admin_name,
        email=admin_email,
        password=admin_password,
    )

    with SessionLocal() as db:
        try:
            admin = db.scalar(
                select(User).where(User.email == validated_admin.email)
            )
            admin_created = admin is None
            if admin is None:
                admin = User(
                    name=validated_admin.name,
                    email=validated_admin.email,
                    password_hash=hash_password(validated_admin.password),
                    role=UserRole.ADMIN,
                    is_active=True,
                )
                db.add(admin)
            else:
                # This command is intentionally demo-only and repeatable. Refreshing
                # the account guarantees the documented credentials keep working.
                admin.name = validated_admin.name
                admin.password_hash = hash_password(validated_admin.password)
                admin.role = UserRole.ADMIN
                admin.is_active = True

            destinations_created = 0
            destinations_skipped = 0
            for data in destinations:
                if find_destination_by_slug(db, data.slug) is not None:
                    destinations_skipped += 1
                    continue
                create_destination(db, data)
                db.flush()
                destinations_created += 1

            db.commit()
        except (IntegrityError, ValueError):
            db.rollback()
            raise

    return DemoSeedResult(
        admin_created=admin_created,
        destinations_created=destinations_created,
        destinations_skipped=destinations_skipped,
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed the hackathon demo admin and destination records"
    )
    parser.add_argument("--admin-name", default=DEFAULT_ADMIN_NAME)
    parser.add_argument("--admin-email", default=DEFAULT_ADMIN_EMAIL)
    parser.add_argument("--admin-password", default=DEFAULT_ADMIN_PASSWORD)
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_DESTINATION_FILE,
        help="Destination JSON file (defaults to data/demo/destinations.json)",
    )
    args = parser.parse_args()

    try:
        destinations = load_seed_file(args.input)
        result = seed_demo(
            admin_name=args.admin_name,
            admin_email=args.admin_email,
            admin_password=args.admin_password,
            destinations=destinations,
        )
    except (IntegrityError, OSError, ValueError) as exc:
        parser.error(str(exc))

    admin_action = "Created" if result.admin_created else "Refreshed"
    print(f"{admin_action} demo admin {args.admin_email}")
    print(
        f"Created {result.destinations_created} demo destinations; "
        f"skipped {result.destinations_skipped} already present"
    )


if __name__ == "__main__":
    main()
