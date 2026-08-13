"""Aggregations over usage_records. There is no separate invoices table."""

from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.instance import Instance
from app.models.usage_record import UsageRecord
from app.schemas.usage import UsageItem


def month_bounds(month: str) -> tuple[datetime, datetime]:
    """`month` is YYYY-MM. Returns [start, end) in UTC."""
    year, mon = (int(part) for part in month.split("-"))
    start = datetime(year, mon, 1, tzinfo=timezone.utc)
    if mon == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, mon + 1, 1, tzinfo=timezone.utc)
    return start, end


def current_month() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def usage_for_month(db: Session, user_id: int, month: str) -> list[UsageItem]:
    """Per-instance compute/storage totals for the given month, scoped to one user."""
    start, end = month_bounds(month)

    rows = (
        db.query(
            Instance.id,
            Instance.name,
            Instance.status,
            func.count(UsageRecord.id).label("hours"),
            func.coalesce(func.sum(UsageRecord.compute_cost_cents), 0).label("compute"),
            func.coalesce(func.sum(UsageRecord.storage_cost_cents), 0).label("storage"),
        )
        .join(UsageRecord, UsageRecord.instance_id == Instance.id)
        .filter(
            Instance.user_id == user_id,
            UsageRecord.hour >= start,
            UsageRecord.hour < end,
        )
        .group_by(Instance.id, Instance.name, Instance.status)
        .order_by(Instance.id)
        .all()
    )

    return [
        UsageItem(
            instance_id=row.id,
            instance_name=row.name,
            status=row.status,
            hours=row.hours,
            compute_cost_cents=row.compute,
            storage_cost_cents=row.storage,
            total_cost_cents=row.compute + row.storage,
        )
        for row in rows
    ]
