from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import AdminUser
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import CurrentUserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[CurrentUserResponse])
async def list_users(
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))
