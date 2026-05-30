from fastapi import APIRouter

from app.schemas.script import ScriptDoctorRequest, ScriptDoctorResponse
from app.services.script_doctor import analyze_script

router = APIRouter(prefix="/script", tags=["script"])


@router.post("/analyze", response_model=ScriptDoctorResponse)
async def analyze_script_doctor(body: ScriptDoctorRequest) -> ScriptDoctorResponse:
    return await analyze_script(
        script_text=body.script_text.strip(),
        pacing_style=body.pacing_style,
        target_audience=body.target_audience.strip(),
        video_genre=body.video_genre,
        expected_length=body.expected_length,
    )
