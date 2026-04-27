"""Pydantic request/response schemas used by the REST API."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class TokenPair(BaseModel):
    """JWT access+refresh pair returned by auth endpoints."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    """Refresh request body (kept explicit for clarity + validation)."""

    refresh_token: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    created_at: datetime


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


class PurchaseOut(BaseModel):
    id: int
    album_id: int
    purchased_at: datetime


class RatingIn(BaseModel):
    value: int = Field(ge=1, le=5)


class RatingOut(BaseModel):
    album_id: int
    value: int
    updated_at: datetime


class LibraryAlbumOut(BaseModel):
    album: AlbumOut
    purchased_at: datetime
    my_rating: RatingOut | None

