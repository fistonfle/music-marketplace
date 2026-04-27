"""FastAPI app factory + router wiring."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.migrations import upgrade_head
from app.routers import albums, artists, auth, library, purchases, ratings
from app.seed import seed_if_empty


def create_app() -> FastAPI:
    app = FastAPI(title="Music Marketplace API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        upgrade_head()
        seed_if_empty()

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(artists.router, prefix="/artists", tags=["artists"])
    app.include_router(albums.router, prefix="/albums", tags=["albums"])
    app.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
    app.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
    app.include_router(library.router, prefix="/library", tags=["library"])

    return app


app = create_app()

