from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.os_image import OsImage
from app.models.plan import Plan
from app.schemas.plan import OsImageResponse, PlanResponse

router = APIRouter(tags=["catalog"])

# Plans and OS images are the public deploy-page catalog (no user-specific
# data, same for every visitor) — intentionally not behind get_current_user
# so the Deploy GPU/CPU pages work as public landing pages, logged out.


@router.get("/plans", response_model=list[PlanResponse])
def list_plans(
    type: str | None = Query(default=None, pattern="^(gpu|cpu)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Plan)
    if type is not None:
        query = query.filter(Plan.type == type)
    return query.order_by(Plan.id).all()


@router.get("/os-images", response_model=list[OsImageResponse])
def list_os_images(db: Session = Depends(get_db)):
    return db.query(OsImage).order_by(OsImage.id).all()
