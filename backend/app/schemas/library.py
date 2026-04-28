from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.album import AlbumOut
from app.schemas.rating import RatingOut


class LibraryAlbumOut(BaseModel):
    album: AlbumOut
    purchased_at: datetime
    my_rating: RatingOut | None

