from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.destination import Destination


class InteractionType(str, Enum):
    DESTINATION_VIEWED = "DESTINATION_VIEWED"
    DESTINATION_SAVED = "DESTINATION_SAVED"
    RECOMMENDATION_SELECTED = "RECOMMENDATION_SELECTED"
    ALTERNATIVE_SELECTED = "ALTERNATIVE_SELECTED"


class RecommendationSearch(Base):
    __tablename__ = "recommendation_searches"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    request_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    result_destination_ids: Mapped[list[int]] = mapped_column(JSON, nullable=False)
    sustainability_config_version: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    ranking_version: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    interactions: Mapped[list["InteractionEvent"]] = relationship(
        back_populates="search"
    )


class SavedDestination(Base):
    __tablename__ = "saved_destinations"
    __table_args__ = (UniqueConstraint("user_id", "destination_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="RESTRICT"), nullable=False
    )
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    destination: Mapped[Destination] = relationship(lazy="selectin")


class InteractionEvent(Base):
    __tablename__ = "interaction_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="RESTRICT"), nullable=False
    )
    recommendation_search_id: Mapped[int | None] = mapped_column(
        ForeignKey("recommendation_searches.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    event_type: Mapped[InteractionType] = mapped_column(
        SqlEnum(InteractionType, name="interaction_type"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    search: Mapped[RecommendationSearch | None] = relationship(
        back_populates="interactions"
    )
    alternative_context: Mapped["AlternativeSelectionContext | None"] = relationship(
        back_populates="event", cascade="all, delete-orphan", uselist=False
    )


class AlternativeSelectionContext(Base):
    """Pressure snapshot for attributable alternative selections only."""

    __tablename__ = "alternative_selection_contexts"
    __table_args__ = (
        UniqueConstraint("event_id"),
        CheckConstraint(
            "source_pressure_value BETWEEN 0 AND 100",
            name="ck_alternative_context_source_pressure",
        ),
        CheckConstraint(
            "selected_pressure_value BETWEEN 0 AND 100",
            name="ck_alternative_context_selected_pressure",
        ),
        CheckConstraint(
            "source_pressure_band IN ('LOW', 'MEDIUM', 'HIGH')",
            name="ck_alternative_context_source_band",
        ),
        CheckConstraint(
            "selected_pressure_band IN ('LOW', 'MEDIUM', 'HIGH')",
            name="ck_alternative_context_selected_band",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("interaction_events.id", ondelete="CASCADE"), nullable=False
    )
    source_destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="RESTRICT"), nullable=False
    )
    pressure_month: Mapped[str] = mapped_column(String(7), nullable=False)
    source_pressure_value: Mapped[Decimal] = mapped_column(
        Numeric(8, 5), nullable=False
    )
    selected_pressure_value: Mapped[Decimal] = mapped_column(
        Numeric(8, 5), nullable=False
    )
    source_pressure_band: Mapped[str] = mapped_column(String(6), nullable=False)
    selected_pressure_band: Mapped[str] = mapped_column(String(6), nullable=False)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)

    event: Mapped[InteractionEvent] = relationship(back_populates="alternative_context")
