"""FastAPI app factory + router wiring."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.migrations import upgrade_head
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

    app.include_router(api_router)

    return app


app = create_app()

