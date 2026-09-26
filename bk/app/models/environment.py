"""Append-only environmental observations for destination coordinates."""

from datetime import datetime
from enum import Enum
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.destination import Destination


class ObservationType(str, Enum):
    WEATHER = "WEATHER"
    AIR_QUALITY = "AIR_QUALITY"


class EnvironmentalObservation(Base):
    __tablename__ = "environmental_observations"
    __table_args__ = (
        UniqueConstraint(
            "destination_id",
            "observation_type",
            "source",
            "source_location",
            "observed_at",
            name="uq_environmental_observation_source_time",
        ),
        Index(
            "ix_environmental_latest",
            "destination_id",
            "observation_type",
            "observed_at",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False
    )
    observation_type: Mapped[ObservationType] = mapped_column(
        SqlEnum(ObservationType, name="observation_type"), nullable=False
    )
    values: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    source_location: Mapped[str] = mapped_column(String(100), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    destination: Mapped[Destination] = relationship()
