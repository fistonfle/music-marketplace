"""Purchase endpoints (purchase-once enforced server-side)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import User
from app.schemas import PurchaseOut
from app.services import purchase_service

router = APIRouter()


@router.post("/{album_id}", response_model=PurchaseOut, status_code=status.HTTP_201_CREATED)
def purchase_album(album_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return purchase_service.purchase_album(db, user, album_id)

