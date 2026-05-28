import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.config import get_settings
from app.schemas.grader import Language

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CoreAI API",
    description="Backend for Indian YouTube creator tools",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.on_event("startup")
async def log_startup() -> None:
    settings = get_settings()
    languages = ", ".join(lang.value for lang in Language)
    logger.info("Supported analyze languages: %s", languages)
    if settings.groq_enabled:
        logger.info(
            "Groq AI: enabled (title=%s, vision=%s)",
            settings.groq_model,
            settings.groq_vision_model,
        )
    else:
        logger.warning(
            "Groq AI: disabled (set GROQ_API_KEY in backend/.env)"
        )
    if settings.openai_images_enabled:
        logger.info(
            "OpenAI thumbnail images: enabled (model=%s, size=%s, count=%d)",
            settings.openai_image_model,
            settings.openai_image_size,
            settings.thumbnail_gen_count,
        )
    else:
        logger.warning(
            "OpenAI thumbnail images: disabled (set OPENAI_API_KEY in backend/.env)"
        )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
