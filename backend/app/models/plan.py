from sqlalchemy import BigInteger, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String, nullable=False)  # "gpu" | "cpu"
    name: Mapped[str] = mapped_column(String, nullable=False)
    gpu_model: Mapped[str | None] = mapped_column(String, nullable=True)
    gpu_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vcpu: Mapped[int] = mapped_column(Integer, nullable=False)
    ram_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    rate_running_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    rate_stopped_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
