"""Store historical weather and air-quality observations.

Revision ID: 20260924_0005
Revises: 20260923_0004
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260924_0005"
down_revision: str | None = "20260923_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    observation_type = sa.Enum("WEATHER", "AIR_QUALITY", name="observation_type")
    op.create_table(
        "environmental_observations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("observation_type", observation_type, nullable=False),
        sa.Column("values", sa.JSON(), nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("source_location", sa.String(100), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["destination_id"], ["destinations.id"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint(
            "destination_id",
            "observation_type",
            "source",
            "source_location",
            "observed_at",
            name="uq_environmental_observation_source_time",
        ),
    )
    op.create_index(
        "ix_environmental_latest",
        "environmental_observations",
        ["destination_id", "observation_type", "observed_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_environmental_latest", table_name="environmental_observations")
    op.drop_table("environmental_observations")
    sa.Enum(name="observation_type").drop(op.get_bind(), checkfirst=True)
