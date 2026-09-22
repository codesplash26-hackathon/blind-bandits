from fastapi import APIRouter

from app.api.routes import (
    admin,
    admin_destinations,
    auth,
    destinations,
    interactions,
    recommendations,
    saved,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(destinations.router)
api_router.include_router(recommendations.router)
api_router.include_router(saved.router)
api_router.include_router(interactions.router)
api_router.include_router(admin.router)
api_router.include_router(admin_destinations.router)
