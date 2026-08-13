from pydantic import BaseModel


class UsageItem(BaseModel):
    instance_id: int
    instance_name: str
    status: str
    hours: int
    compute_cost_cents: int
    storage_cost_cents: int
    total_cost_cents: int


class UsageResponse(BaseModel):
    month: str
    items: list[UsageItem]
    total_compute_cents: int
    total_storage_cents: int
    total_cents: int


class InvoiceResponse(BaseModel):
    month: str
    items: list[UsageItem]
    total_compute_cents: int
    total_storage_cents: int
    total_cents: int


class DashboardSummary(BaseModel):
    active_instances: int
    total_gpus: int
    total_storage_gb: int
    monthly_cost_cents: int
