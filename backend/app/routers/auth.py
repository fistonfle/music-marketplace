from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.security import create_token, hash_password, verify_password, decode_token
from app.deps import get_current_user
from app.models import User
from app.schemas import RefreshIn, TokenPair, UserCreate, UserOut

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, password_hash=hash_password(payload.password), is_admin=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> TokenPair:
    # OAuth2PasswordRequestForm uses `username` field
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    sub = str(user.id)
    return TokenPair(
        access_token=create_token(subject=sub, token_type="access", ttl_seconds=settings.jwt_access_ttl_seconds),
        refresh_token=create_token(subject=sub, token_type="refresh", ttl_seconds=settings.jwt_refresh_ttl_seconds),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(payload_in: RefreshIn, db: Session = Depends(get_db)) -> TokenPair:
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

    return TokenPair(
        access_token=create_token(subject=str(user.id), token_type="access", ttl_seconds=settings.jwt_access_ttl_seconds),
        refresh_token=create_token(subject=str(user.id), token_type="refresh", ttl_seconds=settings.jwt_refresh_ttl_seconds),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user

