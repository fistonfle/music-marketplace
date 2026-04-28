from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class AlbumBase(BaseModel):
    artist_id: int
    name: str = Field(min_length=1, max_length=200)
    price: Decimal = Field(gt=0)


class AlbumCreate(AlbumBase):
    pass


class AlbumUpdate(BaseModel):
    artist_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=200)
    price: Decimal | None = Field(default=None, gt=0)


class AlbumOut(BaseModel):
    id: int
    artist_id: int
    name: str
    price: Decimal
    rating_avg: float | None
    rating_count: int
    created_at: datetime

