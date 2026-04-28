from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Purchase, Rating, User
from app.schemas import RatingIn, RatingOut


def upsert_rating(db: Session, user: User, album_id: int, payload: RatingIn) -> RatingOut:
    # Business rule: users can only rate albums they have purchased.
    purchased = db.query(Purchase).filter(Purchase.user_id == user.id, Purchase.album_id == album_id).first()
    if not purchased:
        raise HTTPException(status_code=403, detail="You can only rate albums you purchased")

    # Upsert: one rating per (user, album). Updates are allowed.
    rating = db.query(Rating).filter(Rating.user_id == user.id, Rating.album_id == album_id).first()
    if rating:
        rating.value = payload.value
    else:
        rating = Rating(user_id=user.id, album_id=album_id, value=payload.value)
        db.add(rating)
    db.commit()
    db.refresh(rating)
    return RatingOut(album_id=rating.album_id, value=rating.value, updated_at=rating.updated_at)

