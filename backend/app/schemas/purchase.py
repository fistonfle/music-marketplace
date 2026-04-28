from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PurchaseOut(BaseModel):
    id: int
    album_id: int
    purchased_at: datetime

