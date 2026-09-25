from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.core.config import get_settings
from app.db.session import get_db
from app.ml.pressure.artifact import MissingPressureModelError
from app.ml.pressure.explanation import explain_regional_pressure
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    predict_regional_pressure,
    pressure_band,
)
from app.models.destination import Activity, Destination, destination_activities
from app.schemas.alternatives import DestinationAlternativesResponse
from app.schemas.destination import DestinationResponse
from app.schemas.pressure import (
    DestinationPressureExplanationResponse,
    DestinationPressureResponse,
)
from app.schemas.simulation import DestinationSimulationResponse, SimulationScenario
from app.schemas.sustainability import DestinationSustainabilityResponse
from app.services.destination_alternatives import suggest_alternatives
from app.services.destinations import (
    destination_load_options,
    get_destination_by_id,
    get_destination_by_identifier,
)
from app.services.sustainability import (
    SustainabilityFactorScores,
    calculate_sustainability_score,
)
from app.services.what_if import simulate_destination

router = APIRouter(prefix="/destinations", tags=["destinations"])


def destination_response(destination: Destination) -> DestinationResponse:
    response = DestinationResponse.model_validate(destination)
    if destination.factor is None:
        return response
    factor = destination.factor
    result = calculate_sustainability_score(
        SustainabilityFactorScores(
            environmental=factor.environmental_score,
            community=factor.community_benefit_score,
            crowd=factor.crowd_score,
            infrastructure=factor.infrastructure_score,
            suitability=factor.tourist_suitability_score,
        ),
        get_settings().sustainability_weights,
    )
    return response.model_copy(
        update={
            "sustainability": DestinationSustainabilityResponse(
                destination_id=destination.id,
                destination_slug=destination.slug,
                **result.model_dump(),
            )
        }
    )


@router.post("/{destination_id}/simulate", response_model=DestinationSimulationResponse)
async def simulate_destination_sustainability(
    destination_id: int,
    scenario: SimulationScenario,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> DestinationSimulationResponse:
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    if destination.factor is None:
        raise HTTPException(
            status_code=404, detail="Sustainability factor data not found"
        )
    settings = get_settings()
    if settings.simulation_policy is None:
        raise HTTPException(
            status_code=503, detail="Simulation policy is not configured"
        )
    factor = destination.factor
    return simulate_destination(
        destination_id=destination.id,
        destination_slug=destination.slug,
        current=SustainabilityFactorScores(
            environmental=factor.environmental_score,
            community=factor.community_benefit_score,
            crowd=factor.crowd_score,
            infrastructure=factor.infrastructure_score,
            suitability=factor.tourist_suitability_score,
        ),
        scenario=scenario,
        policy=settings.simulation_policy,
        sustainability_weights=settings.sustainability_weights,
    )


@router.get(
    "/{destination_id}/alternatives",
    response_model=DestinationAlternativesResponse,
)
async def read_destination_alternatives(
    destination_id: int,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str, Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")],
) -> DestinationAlternativesResponse:
    if month.startswith("0000"):
        raise HTTPException(status_code=422, detail="Invalid forecast month")
    source = get_destination_by_id(db, destination_id)
    if source is None or not source.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    settings = get_settings()
    if settings.pressure_band_thresholds is None:
        raise HTTPException(status_code=503, detail="Pressure bands are not configured")
    try:
        return suggest_alternatives(
            db,
            source,
            month=month,
            artifact_dir=settings.pressure_model_artifact_dir,
            thresholds=settings.pressure_band_thresholds,
            sustainability_weights=settings.sustainability_weights,
        )
    except MissingPressureModelError:
        raise HTTPException(
            status_code=503, detail="Regional pressure model unavailable"
        ) from None
    except ForecastContextUnavailableError:
        raise HTTPException(
            status_code=404, detail="Regional forecast unavailable for month"
        ) from None


@router.get(
    "/{destination_id}/pressure/explanation",
    response_model=DestinationPressureExplanationResponse,
)
async def read_destination_pressure_explanation(
    destination_id: int,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str, Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")],
) -> DestinationPressureExplanationResponse:
    if month.startswith("0000"):
        raise HTTPException(status_code=422, detail="Invalid forecast month")
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    settings = get_settings()
    if settings.pressure_band_thresholds is None:
        raise HTTPException(status_code=503, detail="Pressure bands are not configured")
    try:
        return explain_regional_pressure(
            settings.pressure_model_artifact_dir,
            destination_id=destination.id,
            destination_slug=destination.slug,
            region=destination.region,
            month=month,
            thresholds=settings.pressure_band_thresholds,
        )
    except MissingPressureModelError:
        raise HTTPException(
            status_code=503, detail="Regional pressure model unavailable"
        ) from None
    except ForecastContextUnavailableError:
        raise HTTPException(
            status_code=404, detail="Regional forecast unavailable for month"
        ) from None


@router.get("/{destination_id}/pressure", response_model=DestinationPressureResponse)
async def read_destination_pressure(
    destination_id: int,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str, Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")],
) -> DestinationPressureResponse:
    if month.startswith("0000"):
        raise HTTPException(status_code=422, detail="Invalid forecast month")
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    settings = get_settings()
    if settings.pressure_band_thresholds is None:
        raise HTTPException(status_code=503, detail="Pressure bands are not configured")
    try:
        score, model_version = predict_regional_pressure(
            settings.pressure_model_artifact_dir,
            region=destination.region,
            month=month,
        )
    except MissingPressureModelError:
        raise HTTPException(
            status_code=503, detail="Regional pressure model unavailable"
        ) from None
    except ForecastContextUnavailableError:
        raise HTTPException(
            status_code=404, detail="Regional forecast unavailable for month"
        ) from None
    return DestinationPressureResponse(
        destination_id=destination.id,
        destination_slug=destination.slug,
        region=destination.region,
        month=month,
        predicted_regional_occupancy_rate=score,
        band=pressure_band(score, settings.pressure_band_thresholds),
        model_version=model_version,
    )


@router.get("", response_model=list[DestinationResponse])
async def list_destinations(
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    region: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    landscape: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    activity: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    active: bool = True,
) -> list[DestinationResponse]:
    statement = (
        select(Destination)
        .where(Destination.is_active.is_(active))
        .options(*destination_load_options())
        .order_by(Destination.name)
    )
    if region is not None:
        statement = statement.where(func.lower(Destination.region) == region.lower())
    if landscape is not None:
        statement = statement.where(
            func.lower(Destination.landscape_type) == landscape.lower()
        )
    if activity is not None:
        statement = (
            statement.join(
                destination_activities,
                Destination.id == destination_activities.c.destination_id,
            )
            .join(Activity, Activity.id == destination_activities.c.activity_id)
            .where(func.lower(Activity.slug) == activity.lower())
        )
    return [destination_response(item) for item in db.scalars(statement).unique()]


@router.get(
    "/{destination_id}/sustainability",
    response_model=DestinationSustainabilityResponse,
)
async def read_destination_sustainability(
    destination_id: int,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> DestinationSustainabilityResponse:
    destination = get_destination_by_id(db, destination_id)
    if destination is None or not destination.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found",
        )
    if destination.factor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sustainability factor data not found",
        )

    factor = destination.factor
    result = calculate_sustainability_score(
        SustainabilityFactorScores(
            environmental=factor.environmental_score,
            community=factor.community_benefit_score,
            crowd=factor.crowd_score,
            infrastructure=factor.infrastructure_score,
            suitability=factor.tourist_suitability_score,
        ),
        get_settings().sustainability_weights,
    )
    return DestinationSustainabilityResponse(
        destination_id=destination.id,
        destination_slug=destination.slug,
        **result.model_dump(),
    )


@router.get("/{identifier}", response_model=DestinationResponse)
async def read_destination(
    identifier: str,
    _: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> DestinationResponse:
    destination = get_destination_by_identifier(db, identifier)
    if destination is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found",
        )
    return destination_response(destination)
