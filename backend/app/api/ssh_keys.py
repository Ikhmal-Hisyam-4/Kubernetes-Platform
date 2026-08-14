from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.ssh_key import SshKey
from app.models.user import User
from app.schemas.ssh_key import SshKeyCreateRequest, SshKeyResponse

router = APIRouter(prefix="/ssh-keys", tags=["ssh-keys"])


@router.get("", response_model=list[SshKeyResponse])
def list_ssh_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SshKey)
        .filter(SshKey.user_id == current_user.id)
        .order_by(SshKey.created_at.desc())
        .all()
    )


@router.post("", response_model=SshKeyResponse, status_code=status.HTTP_201_CREATED)
def create_ssh_key(
    payload: SshKeyCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = SshKey(user_id=current_user.id, name=payload.name, public_key=payload.public_key)
    db.add(key)
    db.commit()
    db.refresh(key)
    return key


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ssh_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = (
        db.query(SshKey)
        .filter(SshKey.id == key_id, SshKey.user_id == current_user.id)
        .first()
    )
    if key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SSH key not found")
    db.delete(key)
    db.commit()
