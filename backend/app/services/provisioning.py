import random
import time

from app.core.database import SessionLocal
from app.models.instance import Instance


def fake_ip_address() -> str:
    return f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"


def dns_name_for_ip(ip_address: str) -> str:
    """Builds an AWS EC2-style hostname from the fake IP, e.g. gpu-10-42-201-7.kubex.cloud."""
    return f"gpu-{ip_address.replace('.', '-')}.kubex.cloud"


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
        instance.dns_name = dns_name_for_ip(instance.ip_address)
        db.commit()
    finally:
        db.close()
