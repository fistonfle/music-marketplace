from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    artist_id: Mapped[int] = mapped_column(ForeignKey("artists.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    artist: Mapped["Artist"] = relationship(back_populates="albums")
    purchases: Mapped[list["Purchase"]] = relationship(back_populates="album", cascade="all, delete-orphan")
    ratings: Mapped[list["Rating"]] = relationship(back_populates="album", cascade="all, delete-orphan")


from app.models.artist import Artist  # noqa: E402
from app.models.purchase import Purchase  # noqa: E402
from app.models.rating import Rating  # noqa: E402

