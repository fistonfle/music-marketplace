from fastapi import APIRouter

from app.api.v1.endpoints import albums, artists, auth, library, purchases, ratings

api_router = APIRouter()

# Keep route prefixes identical to the existing frontend integration.
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(artists.router, prefix="/artists", tags=["artists"])
api_router.include_router(albums.router, prefix="/albums", tags=["albums"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
api_router.include_router(library.router, prefix="/library", tags=["library"])

