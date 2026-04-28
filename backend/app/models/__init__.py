"""SQLAlchemy ORM models (package export).

This module re-exports all models so Alembic and application code can import
`app.models` and ensure tables are registered on `Base.metadata`.
"""

from app.models.album import Album
from app.models.artist import Artist
from app.models.purchase import Purchase
from app.models.rating import Rating
from app.models.user import User

__all__ = [
    "User",
    "Artist",
    "Album",
    "Purchase",
    "Rating",
]

