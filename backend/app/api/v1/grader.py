from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.category import VideoCategory
from app.schemas.grader import GraderAnalyzeResponse, Language
from app.services.grader import analyze_submission

router = APIRouter(prefix="/grader", tags=["grader"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
}


def _validate_thumbnail(filename: str | None, content_type: str | None) -> None:
    if not filename:
        raise HTTPException(status_code=400, detail="Thumbnail filename is required.")
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Thumbnail must be a .png or .jpg file.",
        )
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type: {content_type}",
        )


@router.post("/analyze", response_model=GraderAnalyzeResponse)
async def analyze_grader(
    title: str = Form(..., min_length=1, max_length=500),
    category: VideoCategory = Form(...),
    language: Language = Form(...),
    thumbnail: UploadFile = File(...),
    video_context: str | None = Form(
        default=None,
        max_length=500,
        description="Optional brief summary of video content for title AI",
    ),
) -> GraderAnalyzeResponse:
    _validate_thumbnail(thumbnail.filename, thumbnail.content_type)

    image_bytes = await thumbnail.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Thumbnail file is empty.")

    context = video_context.strip() if video_context else None
    if context == "":
        context = None

    _, response = await analyze_submission(
        title=title.strip(),
        category=category,
        language=language,
        image_bytes=image_bytes,
        content_type=thumbnail.content_type,
        video_context=context,
    )
    return response
