from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class ArtistBase(BaseModel):
    real_name: str = Field(min_length=1, max_length=200)
    date_of_birth: date
    performing_name: str = Field(min_length=1, max_length=200)


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(BaseModel):
    real_name: str | None = Field(default=None, min_length=1, max_length=200)
    date_of_birth: date | None = None
    performing_name: str | None = Field(default=None, min_length=1, max_length=200)


class ArtistOut(ArtistBase):
    id: int
    created_at: datetime

