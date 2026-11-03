import random
import time

from app.core.database import SessionLocal
from app.models.instance import Instance


def fake_ip_address() -> str:
    return f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"


REGION_SHORT = {"ap-southeast-1": "sg", "ap-southeast-5": "my"}


def dns_name_for_ip(ip_address: str, location: str | None) -> str:
    """Builds a short hostname from the fake IP and region, e.g. vm-10-42-201-7.sg.kubex.cloud."""
    region = location.split(" ")[0] if location else ""
    return f"vm-{ip_address.replace('.', '-')}.{REGION_SHORT.get(region, 'sg')}.kubex.cloud"


def provision_instance(instance_id: int) -> None:
    """Runs in a background task: waits ~10s then marks the instance running with a fake IP."""
    time.sleep(10)

    db = SessionLocal()
    try:
        instance = db.get(Instance, instance_id)
        if instance is None or instance.status != "provisioning":
            return
        instance.status = "running"
        instance.ip_address = fake_ip_address()
        instance.dns_name = dns_name_for_ip(instance.ip_address, instance.location)
        db.commit()
    finally:
        db.close()
