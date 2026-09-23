"""Authenticated map marker data, without map-rendering concerns."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.ml.pressure.artifact import MissingPressureModelError
from app.schemas.map_data import MapDestinationsResponse
from app.schemas.pressure import PressureBand
from app.services.map_data import MissingPressureThresholdsError, get_map_destinations

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/destinations", response_model=MapDestinationsResponse)
async def list_map_destinations(
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str, Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")],
    region: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    pressure: PressureBand | None = None,
) -> MapDestinationsResponse:
    if month.startswith("0000"):
        raise HTTPException(status_code=422, detail="Invalid forecast month")
    settings = get_settings()
    try:
        return get_map_destinations(
            db,
            month=month,
            region=region,
            pressure_filter=pressure,
            artifact_dir=settings.pressure_model_artifact_dir,
            thresholds=settings.pressure_band_thresholds,
            sustainability_weights=settings.sustainability_weights,
        )
    except (MissingPressureModelError, MissingPressureThresholdsError):
        raise HTTPException(
            status_code=503, detail="Map pressure data unavailable"
        ) from None
