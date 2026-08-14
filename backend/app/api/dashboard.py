from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.instance import Instance
from app.models.plan import Plan
from app.models.usage_record import UsageRecord
from app.models.user import User
from app.schemas.usage import DashboardSummary
from app.services.aggregation import current_month, month_bounds

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

ACTIVE_STATUSES = ("provisioning", "running", "stopped")


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Totals are aggregated in SQL, never summed from a paginated list in the client.
    active_instances, total_storage_gb, total_gpus = (
        db.query(
            func.count(Instance.id),
            func.coalesce(func.sum(Instance.storage_gb), 0),
            func.coalesce(func.sum(Plan.gpu_count), 0),
        )
        .join(Plan, Plan.id == Instance.plan_id)
        .filter(
            Instance.user_id == current_user.id,
            Instance.status.in_(ACTIVE_STATUSES),
        )
        .one()
    )

    start, end = month_bounds(current_month())
    monthly_cost_cents = (
        db.query(
            func.coalesce(
                func.sum(UsageRecord.compute_cost_cents + UsageRecord.storage_cost_cents), 0
            )
        )
        .join(Instance, Instance.id == UsageRecord.instance_id)
        .filter(
            Instance.user_id == current_user.id,
            UsageRecord.hour >= start,
            UsageRecord.hour < end,
        )
        .scalar()
    )

    return DashboardSummary(
        active_instances=active_instances,
        total_gpus=total_gpus,
        total_storage_gb=total_storage_gb,
        monthly_cost_cents=monthly_cost_cents,
    )
