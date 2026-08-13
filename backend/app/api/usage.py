from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.usage import InvoiceResponse, UsageResponse
from app.services.aggregation import current_month, usage_for_month

router = APIRouter(tags=["usage"])

MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"


@router.get("/usage", response_model=UsageResponse)
def get_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    month = current_month()
    items = usage_for_month(db, current_user.id, month)
    return UsageResponse(
        month=month,
        items=items,
        total_compute_cents=sum(i.compute_cost_cents for i in items),
        total_storage_cents=sum(i.storage_cost_cents for i in items),
        total_cents=sum(i.total_cost_cents for i in items),
    )


@router.get("/invoices", response_model=InvoiceResponse)
def get_invoice(
    month: str = Query(pattern=MONTH_PATTERN),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = usage_for_month(db, current_user.id, month)
    return InvoiceResponse(
        month=month,
        items=items,
        total_compute_cents=sum(i.compute_cost_cents for i in items),
        total_storage_cents=sum(i.storage_cost_cents for i in items),
        total_cents=sum(i.total_cost_cents for i in items),
    )
