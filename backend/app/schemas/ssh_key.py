from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SshKeyCreateRequest(BaseModel):
    name: str
    public_key: str


class SshKeyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    public_key: str
    created_at: datetime
