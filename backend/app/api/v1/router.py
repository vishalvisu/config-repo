from fastapi import APIRouter

from app.api.v1.grader import router as grader_router

api_v1_router = APIRouter()
api_v1_router.include_router(grader_router)
