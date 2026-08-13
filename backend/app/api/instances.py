import random

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.instance import Instance
from app.models.plan import Plan
from app.models.user import User
from app.schemas.instance import InstanceCreateRequest, InstanceResponse
from app.services.provisioning import provision_instance

router = APIRouter(prefix="/instances", tags=["instances"])

# Simulated datacenter regions, assigned randomly at deploy time (frozen, like the rate).
LOCATIONS = [
    "us-east-1 (Virginia)",
    "us-west-2 (Oregon)",
    "eu-central-1 (Frankfurt)",
    "ap-southeast-1 (Singapore)",
]


def _get_owned_instance(instance_id: int, db: Session, current_user: User) -> Instance:
    instance = (
        db.query(Instance)
        .filter(Instance.id == instance_id, Instance.user_id == current_user.id)
        .first()
    )
    if instance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instance not found")
    return instance


@router.get("", response_model=list[InstanceResponse])
def list_instances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Instance)
        .filter(Instance.user_id == current_user.id)
        .order_by(Instance.created_at.desc())
        .all()
    )


@router.post("", response_model=InstanceResponse, status_code=status.HTTP_201_CREATED)
def deploy_instance(
    payload: InstanceCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.get(Plan, payload.plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    # Never trust client prices: check balance against the plan's server-side rate.
    if current_user.balance_cents < plan.rate_running_cents:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Insufficient balance")

    instance = Instance(
        user_id=current_user.id,
        plan_id=plan.id,
        name=payload.name,
        os_image=payload.os_image,
        status="provisioning",
        compute_type=plan.type,
        gpu_model=plan.gpu_model,
        location=random.choice(LOCATIONS),
        storage_gb=plan.storage_gb,
        # Rates are frozen at deploy time from the plan, not from the client.
        rate_running_cents=plan.rate_running_cents,
        rate_stopped_cents=plan.rate_stopped_cents,
        ip_address=None,
        dns_name=None,
    )
    db.add(instance)
    db.commit()
    db.refresh(instance)

    background_tasks.add_task(provision_instance, instance.id)

    return instance


@router.get("/{instance_id}", response_model=InstanceResponse)
def get_instance(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_instance(instance_id, db, current_user)


@router.post("/{instance_id}/start", response_model=InstanceResponse)
def start_instance(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    instance = _get_owned_instance(instance_id, db, current_user)
    if instance.status == "terminated":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Instance is terminated")
    instance.status = "running"
    db.commit()
    db.refresh(instance)
    return instance


@router.post("/{instance_id}/stop", response_model=InstanceResponse)
def stop_instance(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    instance = _get_owned_instance(instance_id, db, current_user)
    if instance.status == "terminated":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Instance is terminated")
    instance.status = "stopped"
    db.commit()
    db.refresh(instance)
    return instance


@router.delete("/{instance_id}", response_model=InstanceResponse)
def delete_instance(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    instance = _get_owned_instance(instance_id, db, current_user)
    # Never hard-delete: usage_records references it.
    instance.status = "terminated"
    db.commit()
    db.refresh(instance)
    return instance
