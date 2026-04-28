from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Artist
from app.schemas import ArtistCreate, ArtistUpdate


def list_artists(db: Session, q: str | None = None) -> list[Artist]:
    query = db.query(Artist)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(Artist.performing_name.ilike(like))
    return query.order_by(Artist.created_at.desc()).all()


def create_artist(db: Session, payload: ArtistCreate) -> Artist:
    artist = Artist(**payload.model_dump())
    db.add(artist)
    db.commit()
    db.refresh(artist)
    return artist


def update_artist(db: Session, artist_id: int, payload: ArtistUpdate) -> Artist:
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(artist, k, v)
    db.commit()
    db.refresh(artist)
    return artist


def delete_artist(db: Session, artist_id: int) -> None:
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    db.delete(artist)
    db.commit()

