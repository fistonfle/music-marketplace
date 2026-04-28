from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Album, Purchase, Rating, User
from app.schemas import AlbumOut, LibraryAlbumOut, RatingOut
from app.services.album_service import _to_out as album_to_out


def get_library(db: Session, user: User) -> list[LibraryAlbumOut]:
    # Pre-compute rating aggregates so the library endpoint can return AlbumOut
    # (with avg/count) without running N+1 queries.
    agg_rows = (
        db.query(
            Album.id.label("album_id"),
            func.avg(Rating.value).label("rating_avg"),
            func.count(Rating.id).label("rating_count"),
        )
        .outerjoin(Rating, Rating.album_id == Album.id)
        .group_by(Album.id)
        .all()
    )
    agg = {int(r.album_id): (r.rating_avg, int(r.rating_count)) for r in agg_rows}

    purchases = (
        db.query(Purchase, Album)
        .join(Album, Album.id == Purchase.album_id)
        .filter(Purchase.user_id == user.id)
        .order_by(Purchase.purchased_at.desc())
        .all()
    )
    my_ratings = db.query(Rating).filter(Rating.user_id == user.id).all()
    my_rating_map = {r.album_id: r for r in my_ratings}

    out: list[LibraryAlbumOut] = []
    for p, album in purchases:
        rating_avg, rating_count = agg.get(album.id, (None, 0))
        album_out = album_to_out((album, float(rating_avg) if rating_avg is not None else None, rating_count))
        r = my_rating_map.get(album.id)
        my_rating = RatingOut(album_id=r.album_id, value=r.value, updated_at=r.updated_at) if r else None
        out.append(LibraryAlbumOut(album=album_out, purchased_at=p.purchased_at, my_rating=my_rating))
    return out

