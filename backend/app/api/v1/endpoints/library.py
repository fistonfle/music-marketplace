"""User library endpoint (purchases + your rating)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import User
from app.schemas import LibraryAlbumOut
from app.services import library_service

router = APIRouter()


@router.get("", response_model=list[LibraryAlbumOut])
def library(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[LibraryAlbumOut]:
    return library_service.get_library(db, user)

