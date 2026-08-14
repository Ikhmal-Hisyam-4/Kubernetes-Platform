from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BalanceResponse(BaseModel):
    balance_cents: int


class DepositRequest(BaseModel):
    amount_cents: int = Field(gt=0)
    method: str | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    amount_cents: int
    method: str | None
    status: str
    created_at: datetime


class ThresholdResponse(BaseModel):
    alert_threshold_cents: int
    topup_amount_cents: int


class ThresholdUpdateRequest(BaseModel):
    alert_threshold_cents: int = Field(ge=0)
    topup_amount_cents: int = Field(ge=0)
