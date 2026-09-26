import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.cli import seed_demo as seed_module
from app.core.security import verify_password
from app.models.destination import Destination
from app.models.user import User, UserRole
from app.schemas.destination import DestinationCreate
from tests.test_destinations import EXAMPLE_DESTINATION


class SessionContext:
    def __init__(self, session: Session) -> None:
        self.session = session

    def __enter__(self) -> Session:
        return self.session

    def __exit__(self, *args: object) -> None:
        pass


def test_demo_seed_is_repeatable_and_refreshes_admin_credentials(
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        seed_module,
        "SessionLocal",
        lambda: SessionContext(db_session),
    )
    destinations = [DestinationCreate.model_validate(EXAMPLE_DESTINATION)]

    first = seed_module.seed_demo(
        admin_name="Demo Admin",
        admin_email="demo-admin@example.com",
        admin_password="first-password",
        destinations=destinations,
    )
    second = seed_module.seed_demo(
        admin_name="Updated Demo Admin",
        admin_email="demo-admin@example.com",
        admin_password="updated-password",
        destinations=destinations,
    )

    admin = db_session.scalar(
        select(User).where(User.email == "demo-admin@example.com")
    )
    assert admin is not None
    assert admin.name == "Updated Demo Admin"
    assert admin.role == UserRole.ADMIN
    assert admin.is_active is True
    assert verify_password("updated-password", admin.password_hash)
    assert first.admin_created is True
    assert first.destinations_created == 1
    assert first.destinations_skipped == 0
    assert second.admin_created is False
    assert second.destinations_created == 0
    assert second.destinations_skipped == 1
    assert len(db_session.scalars(select(Destination)).all()) == 1
