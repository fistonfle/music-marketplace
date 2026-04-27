"""Rating endpoints (only allowed for purchased albums)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.deps import get_current_user
from app.models import Purchase, Rating, User
from app.schemas import RatingIn, RatingOut

router = APIRouter()


@router.put("/{album_id}", response_model=RatingOut)
def upsert_rating(
    album_id: int, payload: RatingIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> RatingOut:
    purchased = db.query(Purchase).filter(Purchase.user_id == user.id, Purchase.album_id == album_id).first()
    if not purchased:
        raise HTTPException(status_code=403, detail="You can only rate albums you purchased")

    rating = db.query(Rating).filter(Rating.user_id == user.id, Rating.album_id == album_id).first()
    if rating:
        rating.value = payload.value
    else:
        rating = Rating(user_id=user.id, album_id=album_id, value=payload.value)
        db.add(rating)
    db.commit()
    db.refresh(rating)
    return RatingOut(album_id=rating.album_id, value=rating.value, updated_at=rating.updated_at)

