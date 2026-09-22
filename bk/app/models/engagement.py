from datetime import datetime
from enum import Enum
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, UniqueConstraint, func
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
