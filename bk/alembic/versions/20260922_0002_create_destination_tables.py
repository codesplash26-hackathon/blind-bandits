"""create destination data tables

Revision ID: 20260922_0002
Revises: 20260922_0001
Create Date: 2026-09-22
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260922_0002"
down_revision: str | None = "20260922_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_activities_slug"), "activities", ["slug"], unique=True)

    op.create_table(
        "destinations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=150), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column("longitude", sa.Numeric(precision=10, scale=6), nullable=False),
        sa.Column("landscape_type", sa.String(length=100), nullable=False),
        sa.Column("typical_budget", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("recommended_min_trip_duration", sa.Integer(), nullable=False),
        sa.Column("recommended_max_trip_duration", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "latitude >= -90 AND latitude <= 90",
            name="ck_destinations_latitude_range",
        ),
        sa.CheckConstraint(
            "longitude >= -180 AND longitude <= 180",
            name="ck_destinations_longitude_range",
        ),
        sa.CheckConstraint(
            "typical_budget >= 0",
            name="ck_destinations_typical_budget_nonnegative",
        ),
        sa.CheckConstraint(
            "recommended_min_trip_duration > 0",
            name="ck_destinations_min_duration_positive",
        ),
        sa.CheckConstraint(
            "recommended_max_trip_duration >= recommended_min_trip_duration",
            name="ck_destinations_duration_order",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_destinations_district"),
        "destinations",
        ["district"],
        unique=False,
    )
    op.create_index(
        op.f("ix_destinations_is_active"),
        "destinations",
        ["is_active"],
        unique=False,
    )
    op.create_index(
        op.f("ix_destinations_landscape_type"),
        "destinations",
        ["landscape_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_destinations_region"),
        "destinations",
        ["region"],
        unique=False,
    )
    op.create_index(
        op.f("ix_destinations_slug"),
        "destinations",
        ["slug"],
        unique=True,
    )

    op.create_table(
        "destination_activities",
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("activity_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["activity_id"],
            ["activities.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["destination_id"],
            ["destinations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("destination_id", "activity_id"),
    )

    op.create_table(
        "destination_factors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column(
            "environmental_score",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
        ),
        sa.Column(
            "community_benefit_score",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
        ),
        sa.Column("crowd_score", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column(
            "infrastructure_score",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
        ),
        sa.Column(
            "tourist_suitability_score",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
        ),
        sa.Column("data_source", sa.String(length=500), nullable=False),
        sa.Column(
            "confidence_level",
            sa.Enum("LOW", "MEDIUM", "HIGH", name="confidence_level"),
            nullable=False,
        ),
        sa.Column(
            "value_type",
            sa.Enum(
                "MEASURED",
                "ESTIMATED",
                "PROXY",
                name="factor_value_type",
            ),
            nullable=False,
        ),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "community_benefit_score BETWEEN 0 AND 100",
            name="ck_destination_factors_community_benefit_score",
        ),
        sa.CheckConstraint(
            "crowd_score BETWEEN 0 AND 100",
            name="ck_destination_factors_crowd_score",
        ),
        sa.CheckConstraint(
            "environmental_score BETWEEN 0 AND 100",
            name="ck_destination_factors_environmental_score",
        ),
        sa.CheckConstraint(
            "infrastructure_score BETWEEN 0 AND 100",
            name="ck_destination_factors_infrastructure_score",
        ),
        sa.CheckConstraint(
            "tourist_suitability_score BETWEEN 0 AND 100",
            name="ck_destination_factors_tourist_suitability_score",
        ),
        sa.ForeignKeyConstraint(
            ["destination_id"],
            ["destinations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("destination_id"),
    )


def downgrade() -> None:
    op.drop_table("destination_factors")
    op.drop_table("destination_activities")
    op.drop_index(op.f("ix_destinations_slug"), table_name="destinations")
    op.drop_index(op.f("ix_destinations_region"), table_name="destinations")
    op.drop_index(
        op.f("ix_destinations_landscape_type"),
        table_name="destinations",
    )
    op.drop_index(op.f("ix_destinations_is_active"), table_name="destinations")
    op.drop_index(op.f("ix_destinations_district"), table_name="destinations")
    op.drop_table("destinations")
    op.drop_index(op.f("ix_activities_slug"), table_name="activities")
    op.drop_table("activities")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        sa.Enum(name="factor_value_type").drop(bind, checkfirst=True)
        sa.Enum(name="confidence_level").drop(bind, checkfirst=True)
