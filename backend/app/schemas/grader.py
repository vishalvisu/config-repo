from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class Niche(StrEnum):
    TECH = "Tech"
    GAMING = "Gaming"
    FINANCE = "Finance"
    VLOGS = "Vlogs"
    COMEDY = "Comedy"
    INFOTAINMENT = "Infotainment"


class Language(StrEnum):
    ENGLISH = "English"
    HINGLISH = "Hinglish"
    PURE_HINDI = "Pure Hindi"
    TAMIL = "Tamil"
    TELUGU = "Telugu"
    BENGALI = "Bengali"
    MARATHI = "Marathi"
    KANNADA = "Kannada"
    MALAYALAM = "Malayalam"
    GUJARATI = "Gujarati"
    PUNJABI = "Punjabi"
    ODIA = "Odia"
    OTHER_REGIONAL = "Other Regional"


CtrGrade = Literal["A", "B", "C", "D", "F"]


class GraderSummary(BaseModel):
    ctr_grade: CtrGrade
    overall_feedback: str


class GraderScores(BaseModel):
    text_contrast: int = Field(ge=0, le=100)
    mobile_legibility: int = Field(ge=0, le=100)
    curiosity_score: int = Field(ge=0, le=100)


class VisualCritique(BaseModel):
    flaw: str
    fix: str


class TitleOptimization(BaseModel):
    flaw: str
    hinglish_alternatives: list[str]


class GeneratedThumbnail(BaseModel):
    prompt_used: str
    image_base64: str


class ThumbnailOptimization(BaseModel):
    flaw: str
    fix: str
    thumbnail_alternatives: list[str]
    on_image_text_language: str | None = None
    generated_thumbnails: list[GeneratedThumbnail] = Field(default_factory=list)


class GraderAnalyzeResponse(BaseModel):
    summary: GraderSummary
    scores: GraderScores
    visual_critique: VisualCritique
    title_optimization: TitleOptimization
    thumbnail_optimization: ThumbnailOptimization
