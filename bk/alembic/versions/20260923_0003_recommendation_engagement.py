"""Persist recommendation searches and destination engagement.

Revision ID: 20260923_0003
Revises: 20260922_0002
Create Date: 2026-09-23
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260923_0003"
down_revision: str | None = "20260922_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recommendation_searches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("request_data", sa.JSON(), nullable=False),
        sa.Column("result_destination_ids", sa.JSON(), nullable=False),
        sa.Column("sustainability_config_version", sa.String(100), nullable=False),
        sa.Column("ranking_version", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recommendation_searches_user_id"),
        "recommendation_searches",
        ["user_id"],
    )

    op.create_table(
        "saved_destinations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column(
            "saved_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["destination_id"], ["destinations.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "destination_id"),
    )
    op.create_index(
        op.f("ix_saved_destinations_user_id"),
        "saved_destinations",
        ["user_id"],
    )

    op.create_table(
        "interaction_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("recommendation_search_id", sa.Integer(), nullable=True),
        sa.Column(
            "event_type",
            sa.Enum(
                "DESTINATION_VIEWED",
                "DESTINATION_SAVED",
                "RECOMMENDATION_SELECTED",
                "ALTERNATIVE_SELECTED",
                name="interaction_type",
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["destination_id"], ["destinations.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["recommendation_search_id"],
            ["recommendation_searches.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_interaction_events_user_id"),
        "interaction_events",
        ["user_id"],
    )
    op.create_index(
        op.f("ix_interaction_events_recommendation_search_id"),
        "interaction_events",
        ["recommendation_search_id"],
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_interaction_events_recommendation_search_id"),
        table_name="interaction_events",
    )
    op.drop_index(
        op.f("ix_interaction_events_user_id"), table_name="interaction_events"
    )
    op.drop_table("interaction_events")
    op.drop_index(
        op.f("ix_saved_destinations_user_id"), table_name="saved_destinations"
    )
    op.drop_table("saved_destinations")
    op.drop_index(
        op.f("ix_recommendation_searches_user_id"),
        table_name="recommendation_searches",
    )
    op.drop_table("recommendation_searches")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        sa.Enum(name="interaction_type").drop(bind, checkfirst=True)
