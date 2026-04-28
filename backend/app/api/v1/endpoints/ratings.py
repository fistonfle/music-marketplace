"""Rating endpoints (only allowed for purchased albums)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import User
from app.schemas import RatingIn, RatingOut
from app.services import rating_service

router = APIRouter()


@router.put("/{album_id}", response_model=RatingOut)
def upsert_rating(
    album_id: int, payload: RatingIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> RatingOut:
    return rating_service.upsert_rating(db, user, album_id, payload)

