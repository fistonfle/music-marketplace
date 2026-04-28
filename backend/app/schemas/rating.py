from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class RatingIn(BaseModel):
    value: int = Field(ge=1, le=5)


class RatingOut(BaseModel):
    album_id: int
    value: int
    updated_at: datetime

