from pydantic import BaseModel, ConfigDict


class PlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    name: str
    gpu_model: str | None
    gpu_count: int
    vcpu: int
    ram_gb: int
    storage_gb: int
    rate_running_cents: int
    rate_stopped_cents: int


class OsImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
