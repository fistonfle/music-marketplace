from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.db import get_db
from app.schemas import ArtistCreate, ArtistOut, ArtistUpdate
from app.services import artist_service

router = APIRouter()


@router.get("", response_model=list[ArtistOut])
def list_artists(db: Session = Depends(get_db), q: str | None = None):
    return artist_service.list_artists(db, q=q)


@router.post("", response_model=ArtistOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_artist(payload: ArtistCreate, db: Session = Depends(get_db)):
    return artist_service.create_artist(db, payload)


@router.put("/{artist_id}", response_model=ArtistOut, dependencies=[Depends(require_admin)])
def update_artist(artist_id: int, payload: ArtistUpdate, db: Session = Depends(get_db)):
    return artist_service.update_artist(db, artist_id, payload)


@router.delete("/{artist_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_artist(artist_id: int, db: Session = Depends(get_db)) -> None:
    artist_service.delete_artist(db, artist_id)
    return None

