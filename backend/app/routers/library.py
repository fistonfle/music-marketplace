"""Library endpoints (purchased albums + user rating + aggregate rating)."""

from sqlalchemy import func
from sqlalchemy.orm import Session, aliased
from fastapi import APIRouter, Depends

from app.core.db import get_db
from app.deps import get_current_user
from app.models import Album, Purchase, Rating, User
from app.schemas import AlbumOut, LibraryAlbumOut, RatingOut

router = APIRouter()


@router.get("", response_model=list[LibraryAlbumOut])
def get_library(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[LibraryAlbumOut]:
    MyRating = aliased(Rating)

    rating_avg = func.avg(Rating.value).label("rating_avg")
    rating_count = func.count(Rating.id).label("rating_count")

    rows = (
        db.query(Purchase, Album, rating_avg, rating_count, MyRating)
        .join(Album, Album.id == Purchase.album_id)
        .outerjoin(Rating, Rating.album_id == Album.id)
        .outerjoin(MyRating, (MyRating.album_id == Album.id) & (MyRating.user_id == user.id))
        .filter(Purchase.user_id == user.id)
        .group_by(Purchase.id, Album.id, MyRating.id)
        .order_by(Purchase.purchased_at.desc())
        .all()
    )

    out: list[LibraryAlbumOut] = []
    for purchase, album, avg_val, cnt_val, my in rows:
        out.append(
            LibraryAlbumOut(
                album=AlbumOut(
                    id=album.id,
                    artist_id=album.artist_id,
                    name=album.name,
                    price=album.price,
                    rating_avg=float(avg_val) if avg_val is not None else None,
                    rating_count=int(cnt_val),
                    created_at=album.created_at,
                ),
                purchased_at=purchase.purchased_at,
                my_rating=RatingOut(album_id=album.id, value=my.value, updated_at=my.updated_at) if my else None,
            )
        )
    return out

