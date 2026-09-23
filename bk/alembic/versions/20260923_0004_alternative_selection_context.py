"""Snapshot pressure context for attributable alternative selections.

Revision ID: 20260923_0004
Revises: 20260923_0003
Create Date: 2026-09-23
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260923_0004"
down_revision: str | None = "20260923_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "alternative_selection_contexts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), nullable=False),
        sa.Column("source_destination_id", sa.Integer(), nullable=False),
        sa.Column("pressure_month", sa.String(7), nullable=False),
        sa.Column("source_pressure_value", sa.Numeric(8, 5), nullable=False),
        sa.Column("selected_pressure_value", sa.Numeric(8, 5), nullable=False),
        sa.Column("source_pressure_band", sa.String(6), nullable=False),
        sa.Column("selected_pressure_band", sa.String(6), nullable=False),
        sa.Column("model_version", sa.String(100), nullable=False),
        sa.ForeignKeyConstraint(
            ["event_id"], ["interaction_events.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["source_destination_id"], ["destinations.id"], ondelete="RESTRICT"
        ),
        sa.UniqueConstraint("event_id"),
        sa.CheckConstraint(
            "source_pressure_value BETWEEN 0 AND 100",
            name="ck_alternative_context_source_pressure",
        ),
        sa.CheckConstraint(
            "selected_pressure_value BETWEEN 0 AND 100",
            name="ck_alternative_context_selected_pressure",
        ),
        sa.CheckConstraint(
            "source_pressure_band IN ('LOW', 'MEDIUM', 'HIGH')",
            name="ck_alternative_context_source_band",
        ),
        sa.CheckConstraint(
            "selected_pressure_band IN ('LOW', 'MEDIUM', 'HIGH')",
            name="ck_alternative_context_selected_band",
        ),
    )


def downgrade() -> None:
    op.drop_table("alternative_selection_contexts")
