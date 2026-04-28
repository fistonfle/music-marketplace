from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Album, Purchase, User


def purchase_album(db: Session, user: User, album_id: int) -> Purchase:
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    # NOTE: Payment is intentionally mocked for this challenge.
    # Purchasing here means "add to library" and is enforced server-side.
    purchase = Purchase(user_id=user.id, album_id=album.id)
    db.add(purchase)
    try:
        db.commit()
    except IntegrityError:
        # Prevent duplicate purchases (also enforced via a DB unique constraint).
        db.rollback()
        raise HTTPException(status_code=400, detail="Album already purchased")
    db.refresh(purchase)
    return purchase

