import json
import os
from collections.abc import AsyncGenerator, Generator

import pytest
from httpx2 import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-only-secret-key-with-at-least-32-characters",
)
os.environ["SUSTAINABILITY_WEIGHTS"] = json.dumps(
    {
        "version": "temporary-test-weights-v1",
        "weights": {
            "environmental": "0.20",
            "community": "0.20",
            "crowd": "0.20",
            "infrastructure": "0.20",
            "suitability": "0.20",
        },
    }
)

from app.core.config import Settings

# Test settings must not merge with developer-specific values from bk/.env.
Settings.model_config["env_file"] = None

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User, UserRole


@pytest.fixture
def db_session() -> Generator[Session]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    testing_session = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )
    with testing_session() as session:
        yield session
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
async def client(db_session: Session) -> AsyncGenerator[AsyncClient]:
    async def override_get_db() -> AsyncGenerator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session: Session) -> User:
    user = User(
        name="Administrator",
        email="admin@example.com",
        password_hash=hash_password("admin-password"),
        role=UserRole.ADMIN,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


async def login_headers(
    client: AsyncClient,
    email: str,
    password: str,
) -> dict[str, str]:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
