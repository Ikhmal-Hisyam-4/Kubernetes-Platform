from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"
    __table_args__ = (UniqueConstraint("instance_id", "hour", name="uq_usage_records_instance_hour"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    instance_id: Mapped[int] = mapped_column(ForeignKey("instances.id"), nullable=False, index=True)
    hour: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    compute_cost_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_cost_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)

    instance: Mapped["Instance"] = relationship(back_populates="usage_records")
