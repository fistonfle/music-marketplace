"""Artist endpoints (public listing/search; admin CRUD)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.deps import require_admin
from app.models import Artist
from app.schemas import ArtistCreate, ArtistOut, ArtistUpdate

router = APIRouter()


@router.get("", response_model=list[ArtistOut])
def list_artists(db: Session = Depends(get_db), q: str | None = None) -> list[Artist]:
    query = db.query(Artist)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(Artist.performing_name.ilike(like) | Artist.real_name.ilike(like))
    return query.order_by(Artist.performing_name.asc()).all()


@router.post("", response_model=ArtistOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_artist(payload: ArtistCreate, db: Session = Depends(get_db)) -> Artist:
    artist = Artist(**payload.model_dump())
    db.add(artist)
    db.commit()
    db.refresh(artist)
    return artist


@router.put("/{artist_id}", response_model=ArtistOut, dependencies=[Depends(require_admin)])
def update_artist(artist_id: int, payload: ArtistUpdate, db: Session = Depends(get_db)) -> Artist:
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(artist, k, v)
    db.commit()
    db.refresh(artist)
    return artist


@router.delete("/{artist_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_artist(artist_id: int, db: Session = Depends(get_db)) -> None:
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    db.delete(artist)
    db.commit()
    return None

