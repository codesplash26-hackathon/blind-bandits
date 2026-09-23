from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import AdminUser
from app.core.config import get_settings
from app.db.session import get_db
from app.ml.pressure.artifact import MissingPressureModelError
from app.models.user import User
from app.schemas.auth import CurrentUserResponse
from app.schemas.dashboard import AdminDashboardResponse
from app.services.dashboard import build_admin_dashboard
from app.services.map_data import MissingPressureThresholdsError

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def read_admin_dashboard(
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str, Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")],
) -> AdminDashboardResponse:
    if month.startswith("0000"):
        raise HTTPException(status_code=422, detail="Invalid forecast month")
    settings = get_settings()
    try:
        return build_admin_dashboard(
            db,
            month=month,
            artifact_dir=settings.pressure_model_artifact_dir,
            thresholds=settings.pressure_band_thresholds,
            sustainability_weights=settings.sustainability_weights,
        )
    except (MissingPressureModelError, MissingPressureThresholdsError):
        raise HTTPException(
            status_code=503, detail="Dashboard pressure data unavailable"
        ) from None


@router.get("/users", response_model=list[CurrentUserResponse])
async def list_users(
    _: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))
