"""Add reviewed visitor-pressure model regions to destinations.

Revision ID: 20260926_0007
Revises: 20260926_0006
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260926_0007"
down_revision: str | None = "20260926_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "destinations",
        sa.Column("pressure_region", sa.String(length=100), nullable=True),
    )
    op.create_check_constraint(
        "ck_destinations_pressure_region",
        "destinations",
        "pressure_region IS NULL OR pressure_region IN "
        "('Ancient Cities', 'Colombo City', 'East Coast', 'Greater Colombo', "
        "'Hill Country', 'Northern Region', 'South Coast')",
    )
    op.create_index(
        "ix_destinations_pressure_region",
        "destinations",
        ["pressure_region"],
    )
    op.execute(
        sa.text(
            """
            UPDATE destinations
            SET pressure_region = CASE slug
                WHEN 'sigiriya' THEN 'Ancient Cities'
                WHEN 'ella' THEN 'Hill Country'
                WHEN 'galle-fort' THEN 'South Coast'
                WHEN 'mirissa' THEN 'South Coast'
                WHEN 'anuradhapura' THEN 'Ancient Cities'
                ELSE NULL
            END
            WHERE slug IN (
                'sigiriya', 'ella', 'galle-fort', 'mirissa',
                'belihuloya', 'anuradhapura'
            )
            """
        )
    )


def downgrade() -> None:
    op.drop_index("ix_destinations_pressure_region", table_name="destinations")
    op.drop_constraint(
        "ck_destinations_pressure_region", "destinations", type_="check"
    )
    op.drop_column("destinations", "pressure_region")
