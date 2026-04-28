"""Album endpoints (public listing/search; admin CRUD)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.db import get_db
from app.schemas import AlbumCreate, AlbumOut, AlbumUpdate
from app.services import album_service

router = APIRouter()


@router.get("", response_model=list[AlbumOut])
def list_albums(db: Session = Depends(get_db), q: str | None = None) -> list[AlbumOut]:
    return album_service.list_albums(db, q=q)


@router.post("", response_model=AlbumOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_album(payload: AlbumCreate, db: Session = Depends(get_db)) -> AlbumOut:
    return album_service.create_album(db, payload)


@router.put("/{album_id}", response_model=AlbumOut, dependencies=[Depends(require_admin)])
def update_album(album_id: int, payload: AlbumUpdate, db: Session = Depends(get_db)) -> AlbumOut:
    return album_service.update_album(db, album_id, payload)


@router.delete("/{album_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_album(album_id: int, db: Session = Depends(get_db)) -> None:
    album_service.delete_album(db, album_id)
    return None

