from __future__ import annotations

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.models import User
from app.schemas import RefreshIn, TokenPair, UserCreate


def register(db: Session, payload: UserCreate) -> User:
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, password_hash=hash_password(payload.password), is_admin=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, form: OAuth2PasswordRequestForm) -> TokenPair:
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return _issue_pair(str(user.id))


def refresh(db: Session, payload_in: RefreshIn) -> TokenPair:
    try:
        payload = decode_token(payload_in.refresh_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from e

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(sub)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    return _issue_pair(str(user.id))


def _issue_pair(subject: str) -> TokenPair:
    return TokenPair(
        access_token=create_token(subject=subject, token_type="access", ttl_seconds=settings.jwt_access_ttl_seconds),
        refresh_token=create_token(subject=subject, token_type="refresh", ttl_seconds=settings.jwt_refresh_ttl_seconds),
    )

