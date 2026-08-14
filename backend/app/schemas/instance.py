from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InstanceCreateRequest(BaseModel):
    plan_id: int
    name: str
    os_image: str


class InstanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plan_id: int
    name: str
    os_image: str
    status: str
    compute_type: str
    gpu_model: str | None
    location: str | None
    storage_gb: int
    rate_running_cents: int
    rate_stopped_cents: int
    ip_address: str | None
    dns_name: str | None
    created_at: datetime
