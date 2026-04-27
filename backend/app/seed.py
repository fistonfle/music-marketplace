"""Seed data for review/demo (idempotent, minimal)."""

from datetime import date

from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.models import Album, Artist, User


def seed_if_empty() -> None:
    db: Session = SessionLocal()
    try:
        has_users = db.query(User.id).first() is not None
        if not has_users:
            admin = User(email="admin@example.com", password_hash=hash_password("admin123"), is_admin=True)
            user = User(email="user@example.com", password_hash=hash_password("user123"), is_admin=False)
            db.add_all([admin, user])
            db.commit()

        has_artists = db.query(Artist.id).first() is not None
        if not has_artists:
            a1 = Artist(real_name="Abel Tesfaye", performing_name="The Weeknd", date_of_birth=date(1990, 2, 16))
            a2 = Artist(real_name="Robyn Fenty", performing_name="Rihanna", date_of_birth=date(1988, 2, 20))
            a3 = Artist(real_name="Aubrey Graham", performing_name="Drake", date_of_birth=date(1986, 10, 24))
            db.add_all([a1, a2, a3])
            db.flush()

            albums = [
                Album(artist_id=a1.id, name="After Hours", price=9.99),
                Album(artist_id=a1.id, name="Dawn FM", price=8.99),
                Album(artist_id=a2.id, name="ANTI", price=10.99),
                Album(artist_id=a3.id, name="Views", price=7.99),
            ]
            db.add_all(albums)
            db.commit()
    finally:
        db.close()

