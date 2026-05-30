from enum import StrEnum

from pydantic import BaseModel, Field


class PacingStyle(StrEnum):
    FAST = "Fast"
    BALANCED = "Balanced"
    STORYTELLING = "Storytelling"
    TUTORIAL = "Tutorial"


class HookAnalysis(BaseModel):
    dikkat: str = Field(description="Critique of the opening hook (DIKKAT)")
    kya_badlo: str = Field(
        description="Suggested hook rewrite (KYA BADLO) with a quoted concrete example"
    )
    hook_score: int = Field(ge=0, le=100)


class BoredomZone(BaseModel):
    zone_label: str = Field(
        description="Human-readable segment label, e.g. 'Sentences 3–7'",
    )
    start_sentence: int | None = Field(default=None, ge=1)
    end_sentence: int | None = Field(default=None, ge=1)
    start_seconds: int | None = Field(default=None, ge=0)
    end_seconds: int | None = Field(default=None, ge=0)
    dikkat: str = Field(description="What loses viewer attention in this segment")
    kya_badlo: str = Field(
        description="Suggested rewrite for this segment with a quoted concrete example"
    )


class ScriptDoctorRequest(BaseModel):
    script_text: str = Field(min_length=50, max_length=15000)
    pacing_style: PacingStyle


class ScriptDoctorResponse(BaseModel):
    hook: HookAnalysis
    retention_score: int = Field(ge=0, le=100)
    overall_feedback: str
    pacing_feedback: str
    boredom_zones: list[BoredomZone] = Field(default_factory=list)
