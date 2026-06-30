"""Create PIS tables and add dimension to indicators

Revision ID: a1b2c3d4e5f6
Revises: 7e00628f2ca1
Create Date: 2026-06-30

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "7e00628f2ca1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "indicators",
        sa.Column(
            "dimension", sa.String(50), nullable=True, index=True,
            comment="PIS dimension: health, education, economy, employment, investment, infrastructure, security, environment, transportation, water, agriculture, tourism",
        ),
    )

    op.create_table(
        "pis_config",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("dimension", sa.String(50), unique=True, nullable=False, index=True),
        sa.Column("weight", sa.Float(), nullable=False),
        sa.Column("label_en", sa.String(100), nullable=False),
        sa.Column("label_fr", sa.String(100), nullable=False),
        sa.Column("label_ar", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "pis_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("province_code", sa.String(6), nullable=False, index=True),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("quarter", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("composite_score", sa.Float(), nullable=False),
        sa.Column("dimension_scores", postgresql.JSON(), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("calculated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "pis_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("province_code", sa.String(6), nullable=False, index=True),
        sa.Column("snapshot_date", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("composite_score", sa.Float(), nullable=False),
        sa.Column("dimension_scores", postgresql.JSON(), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("total_indicators", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "pis_alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("province_code", sa.String(6), nullable=False, index=True),
        sa.Column("alert_type", sa.String(50), nullable=False, index=True),
        sa.Column("severity", sa.String(20), nullable=False, server_default=sa.text("'info'")),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("resolved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "pis_recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("province_code", sa.String(6), nullable=False, index=True),
        sa.Column("dimension", sa.String(50), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("implemented", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("implemented_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("pis_recommendations")
    op.drop_table("pis_alerts")
    op.drop_table("pis_snapshots")
    op.drop_table("pis_scores")
    op.drop_table("pis_config")
    op.drop_column("indicators", "dimension")
