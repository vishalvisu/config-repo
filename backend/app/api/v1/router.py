from fastapi import APIRouter

from app.api.v1.grader import router as grader_router
from app.api.v1.script import router as script_router

api_v1_router = APIRouter()
api_v1_router.include_router(grader_router)
api_v1_router.include_router(script_router)
