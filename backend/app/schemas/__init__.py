"""Pydantic schemas (package export)."""

from app.schemas.album import AlbumBase, AlbumCreate, AlbumOut, AlbumUpdate
from app.schemas.artist import ArtistBase, ArtistCreate, ArtistOut, ArtistUpdate
from app.schemas.auth import RefreshIn, TokenPair, UserCreate, UserOut
from app.schemas.library import LibraryAlbumOut
from app.schemas.purchase import PurchaseOut
from app.schemas.rating import RatingIn, RatingOut

__all__ = [
    "TokenPair",
    "RefreshIn",
    "UserCreate",
    "UserOut",
    "ArtistBase",
    "ArtistCreate",
    "ArtistUpdate",
    "ArtistOut",
    "AlbumBase",
    "AlbumCreate",
    "AlbumUpdate",
    "AlbumOut",
    "PurchaseOut",
    "RatingIn",
    "RatingOut",
    "LibraryAlbumOut",
]

