from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.billing import (
    BalanceResponse,
    DepositRequest,
    ThresholdResponse,
    ThresholdUpdateRequest,
    TransactionResponse,
)

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/balance", response_model=BalanceResponse)
def get_balance(current_user: User = Depends(get_current_user)):
    return BalanceResponse(balance_cents=current_user.balance_cents)


@router.post("/deposit", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def deposit(
    payload: DepositRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = Transaction(
        user_id=current_user.id,
        type="deposit",
        amount_cents=payload.amount_cents,
        method=payload.method,
        status="completed",
    )
    db.add(transaction)
    current_user.balance_cents += payload.amount_cents
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/transactions", response_model=list[TransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )


@router.get("/threshold", response_model=ThresholdResponse)
def get_threshold(current_user: User = Depends(get_current_user)):
    return ThresholdResponse(
        alert_threshold_cents=current_user.alert_threshold_cents,
        topup_amount_cents=current_user.topup_amount_cents,
    )


@router.put("/threshold", response_model=ThresholdResponse)
def update_threshold(
    payload: ThresholdUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.alert_threshold_cents = payload.alert_threshold_cents
    current_user.topup_amount_cents = payload.topup_amount_cents
    db.commit()
    db.refresh(current_user)
    return ThresholdResponse(
        alert_threshold_cents=current_user.alert_threshold_cents,
        topup_amount_cents=current_user.topup_amount_cents,
    )
