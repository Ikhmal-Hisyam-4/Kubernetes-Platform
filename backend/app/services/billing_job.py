"""Hourly billing job.

Charges every non-terminated instance for one hour of compute + storage, then
settles each affected user's balance (auto top-up / stop-on-zero).

Idempotent: usage_records has UNIQUE (instance_id, hour) and we insert with
ON CONFLICT DO NOTHING, so running the job twice for the same hour charges once.
"""

from datetime import datetime, timezone

from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.instance import Instance
from app.models.transaction import Transaction
from app.models.usage_record import UsageRecord
from app.models.user import User


def current_hour(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(minute=0, second=0, microsecond=0)


def run_billing_for_hour(db: Session, hour: datetime) -> dict[int, int]:
    """Insert usage records for `hour`. Returns {user_id: newly_charged_cents}."""
    instances = db.query(Instance).filter(Instance.status != "terminated").all()

    charged_by_user: dict[int, int] = {}

    for inst in instances:
        rate = inst.rate_running_cents if inst.status == "running" else inst.rate_stopped_cents
        compute = rate
        storage = inst.storage_gb * settings.storage_rate_per_gb_hour_cents

        stmt = (
            pg_insert(UsageRecord)
            .values(
                instance_id=inst.id,
                hour=hour,
                compute_cost_cents=compute,
                storage_cost_cents=storage,
            )
            .on_conflict_do_nothing(index_elements=["instance_id", "hour"])
            .returning(UsageRecord.id)
        )
        inserted = db.execute(stmt).scalar_one_or_none()

        # Only charge the user when this hour was not already recorded.
        if inserted is not None:
            charged_by_user[inst.user_id] = charged_by_user.get(inst.user_id, 0) + compute + storage

    return charged_by_user


def settle_user(db: Session, user: User, amount_cents: int) -> None:
    """Deduct the hour's charges, then apply auto top-up / stop instances as needed."""
    user.balance_cents -= amount_cents

    # Auto top-up when the balance falls below the user's alert threshold.
    # A threshold of 0 means the feature is off.
    if user.alert_threshold_cents > 0 and user.balance_cents < user.alert_threshold_cents:
        if user.topup_amount_cents > 0:
            db.add(
                Transaction(
                    user_id=user.id,
                    type="auto_topup",
                    amount_cents=user.topup_amount_cents,
                    method="auto",
                    status="completed",
                )
            )
            user.balance_cents += user.topup_amount_cents

    # Out of money: stop everything still running.
    if user.balance_cents <= 0:
        (
            db.query(Instance)
            .filter(Instance.user_id == user.id, Instance.status == "running")
            .update({Instance.status: "stopped"}, synchronize_session=False)
        )


def run_hourly_billing(hour: datetime | None = None) -> None:
    hour = hour or current_hour()
    db = SessionLocal()
    try:
        charged_by_user = run_billing_for_hour(db, hour)

        for user_id, amount in charged_by_user.items():
            user = db.get(User, user_id)
            if user is not None:
                settle_user(db, user, amount)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
