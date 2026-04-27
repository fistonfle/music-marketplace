"""Album endpoints (public listing/search; admin CRUD)."""

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.db import get_db
from app.deps import require_admin
from app.models import Album, Artist, Rating
from app.schemas import AlbumCreate, AlbumOut, AlbumUpdate

router = APIRouter()


def _album_out_rows(db: Session, q: str | None = None) -> list[tuple[Album, float | None, int]]:
    query = (
        db.query(
            Album,
            func.avg(Rating.value).label("rating_avg"),
            func.count(Rating.id).label("rating_count"),
        )
        .outerjoin(Rating, Rating.album_id == Album.id)
        .group_by(Album.id)
    )
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(Album.name.ilike(like))
    return query.order_by(Album.created_at.desc()).all()


def _to_out(row: tuple[Album, float | None, int]) -> AlbumOut:
    album, rating_avg, rating_count = row
    return AlbumOut(
        id=album.id,
        artist_id=album.artist_id,
        name=album.name,
        price=album.price,
        rating_avg=float(rating_avg) if rating_avg is not None else None,
        rating_count=int(rating_count),
        created_at=album.created_at,
    )


@router.get("", response_model=list[AlbumOut])
def list_albums(db: Session = Depends(get_db), q: str | None = None) -> list[AlbumOut]:
    return [_to_out(r) for r in _album_out_rows(db, q=q)]


@router.post("", response_model=AlbumOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_album(payload: AlbumCreate, db: Session = Depends(get_db)) -> AlbumOut:
    artist = db.query(Artist).filter(Artist.id == payload.artist_id).first()
    if not artist:
        raise HTTPException(status_code=400, detail="Artist does not exist")
    album = Album(artist_id=payload.artist_id, name=payload.name, price=payload.price)
    db.add(album)
    db.commit()
    db.refresh(album)
    return _to_out((album, None, 0))


@router.put("/{album_id}", response_model=AlbumOut, dependencies=[Depends(require_admin)])
def update_album(album_id: int, payload: AlbumUpdate, db: Session = Depends(get_db)) -> AlbumOut:
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    data = payload.model_dump(exclude_unset=True)
    if "artist_id" in data:
        artist = db.query(Artist).filter(Artist.id == data["artist_id"]).first()
        if not artist:
            raise HTTPException(status_code=400, detail="Artist does not exist")
    for k, v in data.items():
        setattr(album, k, v)
    db.commit()
    db.refresh(album)
    row = (
        db.query(
            Album,
            func.avg(Rating.value).label("rating_avg"),
            func.count(Rating.id).label("rating_count"),
        )
        .outerjoin(Rating, Rating.album_id == Album.id)
        .filter(Album.id == album.id)
        .group_by(Album.id)
        .first()
    )
    assert row is not None
    return _to_out(row)


@router.delete("/{album_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_album(album_id: int, db: Session = Depends(get_db)) -> None:
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    db.delete(album)
    db.commit()
    return None

