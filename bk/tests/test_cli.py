import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.cli import create_admin as create_admin_module
from app.models.user import User, UserRole


def test_create_admin_creates_admin(
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class TestSessionContext:
        def __enter__(self) -> Session:
            return db_session

        def __exit__(self, *args: object) -> None:
            pass

    monkeypatch.setattr(
        create_admin_module,
        "SessionLocal",
        TestSessionContext,
    )

    created = create_admin_module.create_admin(
        "Initial Admin",
        "initial-admin@example.com",
        "admin-password",
    )

    stored = db_session.scalar(select(User).where(User.id == created.id))
    assert stored is not None
    assert stored.role == UserRole.ADMIN
    assert stored.password_hash != "admin-password"
