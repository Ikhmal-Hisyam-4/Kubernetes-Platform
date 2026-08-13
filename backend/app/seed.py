"""Seed script for plans and OS images.

Run inside the backend container/venv:
    python -m app.seed
"""

from app.core.database import SessionLocal
from app.models import OsImage, Plan

# Mockups show a flat stopped rate of $0.0050/hr for every plan. Rates are stored
# as whole integer cents, so that rounds to 1 cent/hr.
#
# GPU running rates are pegged to TensorDock's real on-demand pricing (checked Aug 2026):
# - RTX 4090: TensorDock lists ~$0.37/hr on-demand.
# - RTX PRO 6000 Blackwell: no direct TensorDock listing. Estimated at $0.89/hr,
#   between their 4090 ($0.37) and A100 ($1.63) tiers — workstation-class but
#   newer/higher-VRAM (96GB) than the 4090.
# - GB10 Superchip: no TensorDock listing (not a datacenter part — it's the desktop
#   DGX Spark chip: 128GB unified memory, ~1 PFLOP FP4, built for local prototyping,
#   not production serving). Real rental comps run $0.60-$1.00/hr (GB10 Studio $1/hr,
#   DGX Spark forum rental $0.60/hr). Estimated at $0.79/hr, the midpoint — below
#   RTX PRO 6000 ($0.89/hr) since it's the less powerful, lower-tier part.
PLANS = [
    # GPU plans (rates from design/Deploy GPU.png)
    dict(
        type="gpu",
        name="RTX Consumer Server",
        gpu_model="RTX 4090",
        gpu_count=1,
        vcpu=32,
        ram_gb=128,
        storage_gb=100,
        rate_running_cents=37,
        rate_stopped_cents=1,
    ),
    dict(
        type="gpu",
        name="RTX Pro Server",
        gpu_model="RTX PRO 6000 Blackwell",
        gpu_count=1,
        vcpu=64,
        ram_gb=256,
        storage_gb=100,
        rate_running_cents=89,
        rate_stopped_cents=1,
    ),
    dict(
        type="gpu",
        name="GB10 Superchip",
        gpu_model="GB10 Superchip",
        gpu_count=1,
        vcpu=20,
        ram_gb=128,
        storage_gb=100,
        rate_running_cents=79,
        rate_stopped_cents=1,
    ),
    # CPU plans (rates from design/Deploy CPU.png)
    dict(
        type="cpu",
        name="Standard CPU",
        gpu_model=None,
        gpu_count=0,
        vcpu=8,
        ram_gb=32,
        storage_gb=80,
        rate_running_cents=9,
        rate_stopped_cents=1,
    ),
    dict(
        type="cpu",
        name="Compute Optimized",
        gpu_model=None,
        gpu_count=0,
        vcpu=32,
        ram_gb=64,
        storage_gb=160,
        rate_running_cents=29,
        rate_stopped_cents=1,
    ),
    dict(
        type="cpu",
        name="Memory Optimized",
        gpu_model=None,
        gpu_count=0,
        vcpu=16,
        ram_gb=128,
        storage_gb=160,
        rate_running_cents=39,
        rate_stopped_cents=1,
    ),
]

OS_IMAGES = [
    "Ubuntu 24.04 LTS",
    "Rocky Linux 9",
    "Red Hat Enterprise Linux 9",
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Plan).count() == 0:
            db.add_all(Plan(**p) for p in PLANS)
            print(f"Seeded {len(PLANS)} plans")
        else:
            print("Plans already seeded, skipping")

        if db.query(OsImage).count() == 0:
            db.add_all(OsImage(name=name) for name in OS_IMAGES)
            print(f"Seeded {len(OS_IMAGES)} OS images")
        else:
            print("OS images already seeded, skipping")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
