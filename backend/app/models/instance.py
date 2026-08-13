from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Instance(Base):
    __tablename__ = "instances"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    os_image: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="provisioning")
    # Copied from the plan at deploy time, same as rates: later plan edits don't retroactively change it.
    compute_type: Mapped[str] = mapped_column(String, nullable=False, default="gpu")
    gpu_model: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    storage_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    rate_running_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    rate_stopped_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
    dns_name: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="instances")
    plan: Mapped["Plan"] = relationship()
    usage_records: Mapped[list["UsageRecord"]] = relationship(back_populates="instance")
