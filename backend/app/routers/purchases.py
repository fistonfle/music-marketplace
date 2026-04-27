"""Purchase endpoints (purchase-once enforced server-side)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.deps import get_current_user
from app.models import Album, Purchase, User
from app.schemas import PurchaseOut

router = APIRouter()


@router.post("/{album_id}", response_model=PurchaseOut, status_code=status.HTTP_201_CREATED)
def purchase_album(album_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Purchase:
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    purchase = Purchase(user_id=user.id, album_id=album.id)
    db.add(purchase)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Album already purchased")
    db.refresh(purchase)
    return purchase

