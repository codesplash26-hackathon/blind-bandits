from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConfidenceLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class FactorValueType(str, Enum):
    MEASURED = "MEASURED"
    ESTIMATED = "ESTIMATED"
    PROXY = "PROXY"


destination_activities = Table(
    "destination_activities",
    Base.metadata,
    Column(
        "destination_id",
        ForeignKey("destinations.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "activity_id",
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    destinations: Mapped[list["Destination"]] = relationship(
        secondary=destination_activities,
        back_populates="activities",
    )


class Destination(Base):
    __tablename__ = "destinations"
    __table_args__ = (
        CheckConstraint(
            "latitude >= -90 AND latitude <= 90",
            name="ck_destinations_latitude_range",
        ),
        CheckConstraint(
            "longitude >= -180 AND longitude <= 180",
            name="ck_destinations_longitude_range",
        ),
        CheckConstraint(
            "typical_budget >= 0",
            name="ck_destinations_typical_budget_nonnegative",
        ),
        CheckConstraint(
            "recommended_min_trip_duration > 0",
            name="ck_destinations_min_duration_positive",
        ),
        CheckConstraint(
            "recommended_max_trip_duration >= recommended_min_trip_duration",
            name="ck_destinations_duration_order",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    region: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 6), nullable=False)
    landscape_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    typical_budget: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    recommended_min_trip_duration: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    recommended_max_trip_duration: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    activities: Mapped[list[Activity]] = relationship(
        secondary=destination_activities,
        back_populates="destinations",
        lazy="selectin",
    )
    factor: Mapped["DestinationFactor | None"] = relationship(
        back_populates="destination",
        cascade="all, delete-orphan",
        lazy="selectin",
        uselist=False,
    )


class DestinationFactor(Base):
    __tablename__ = "destination_factors"
    __table_args__ = (
        UniqueConstraint("destination_id"),
        CheckConstraint(
            "environmental_score BETWEEN 0 AND 100",
            name="ck_destination_factors_environmental_score",
        ),
        CheckConstraint(
            "community_benefit_score BETWEEN 0 AND 100",
            name="ck_destination_factors_community_benefit_score",
        ),
        CheckConstraint(
            "crowd_score BETWEEN 0 AND 100",
            name="ck_destination_factors_crowd_score",
        ),
        CheckConstraint(
            "infrastructure_score BETWEEN 0 AND 100",
            name="ck_destination_factors_infrastructure_score",
        ),
        CheckConstraint(
            "tourist_suitability_score BETWEEN 0 AND 100",
            name="ck_destination_factors_tourist_suitability_score",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"),
        nullable=False,
    )
    environmental_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    community_benefit_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
    crowd_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    infrastructure_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    tourist_suitability_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
    data_source: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence_level: Mapped[ConfidenceLevel] = mapped_column(
        SqlEnum(ConfidenceLevel, name="confidence_level"),
        nullable=False,
    )
    value_type: Mapped[FactorValueType] = mapped_column(
        SqlEnum(FactorValueType, name="factor_value_type"),
        nullable=False,
    )
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    destination: Mapped[Destination] = relationship(back_populates="factor")
