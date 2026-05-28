import json
import logging

from openai import APIError, APITimeoutError, AsyncOpenAI

from app.config import get_settings
from app.schemas.grader import Language, Niche, ThumbnailOptimization

logger = logging.getLogger(__name__)


class GroqThumbnailError(Exception):
    """Raised when Groq thumbnail recommendation fails."""


def _system_prompt(alternative_count: int) -> str:
    concepts_example = ", ".join(
        f'"concept {i + 1}"' for i in range(alternative_count)
    )
    return f"""You are an expert YouTube thumbnail strategist for Indian creators.
Analyze the uploaded thumbnail image for mobile feed performance (displays ~120px wide).

You MUST respond with valid JSON only (no markdown), exactly this shape:
{{
  "flaw": "one specific issue with the uploaded thumbnail",
  "fix": "one clear actionable fix for the uploaded thumbnail",
  "on_image_text_language": "language name detected from on-image text, or none",
  "thumbnail_alternatives": [{concepts_example}]
}}

Rules:
- Provide exactly {alternative_count} entr{"y" if alternative_count == 1 else "ies"} in thumbnail_alternatives.
- Set on_image_text_language to the language/script of readable on-image text in the upload (e.g. Tamil, Hinglish, English), or "none" if there is no on-image text.
- Language hierarchy for on-image text in thumbnail_alternatives:
  1. If the upload has on-image text: use ONLY that language/script for all hook text in every alternative. Do NOT translate, romanize, or switch languages (e.g. do not change Hindi/Devanagari to English).
  2. If the upload has no on-image text: use the form language from the user message strictly. Do NOT default to English or Hinglish unless that is the form language.
- Do not mix languages on one thumbnail unless the uploaded image already mixes them.
- Each alternative is one paragraph describing a complete thumbnail concept: subject/framing, on-image text, colors, contrast, emotion.
- Concepts must differ from each other and improve on the uploaded image.
- flaw and fix must reference what you see in the uploaded image.
- Optimize for scroll-stop on Indian YouTube mobile feed."""


def _thumbnail_alternative_count() -> int:
    return max(1, get_settings().thumbnail_gen_count)


def _normalize_mime(content_type: str | None) -> str:
    if content_type in ("image/png", "image/jpeg", "image/jpg"):
        return "image/jpeg" if content_type == "image/jpg" else content_type
    return "image/jpeg"


def _user_text(
    title: str,
    niche: Niche,
    language: Language,
    video_context: str | None,
) -> str:
    parts = [
        f"Niche: {niche.value}",
        f"Form language (fallback when upload has no on-image text): {language.value}",
        f"Video title: {title}",
    ]
    if video_context:
        parts.append(f"Video context:\n{video_context}")
    count = _thumbnail_alternative_count()
    parts.append(
        f"\nAnalyze the attached thumbnail. Detect on-image text language and set "
        f"on_image_text_language. Return flaw, fix, and {count} stronger thumbnail concept"
        f"{'' if count == 1 else 's'}."
    )
    return "\n".join(parts)


def _parse_response(content: str, expected_count: int) -> ThumbnailOptimization:
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise GroqThumbnailError(f"Invalid JSON from Groq: {e}") from e

    if "on_image_text_language" not in data:
        raise GroqThumbnailError("Missing on_image_text_language in Groq response")

    on_image_lang = data.get("on_image_text_language")
    if not isinstance(on_image_lang, str) or not on_image_lang.strip():
        raise GroqThumbnailError("on_image_text_language must be a non-empty string")

    try:
        result = ThumbnailOptimization.model_validate(data)
    except Exception as e:
        raise GroqThumbnailError(f"Response validation failed: {e}") from e

    if len(result.thumbnail_alternatives) != expected_count:
        raise GroqThumbnailError(
            f"Expected {expected_count} thumbnail alternative(s), "
            f"got {len(result.thumbnail_alternatives)}"
        )

    return result


async def recommend_thumbnail(
    image_b64: str,
    mime_type: str | None,
    title: str,
    niche: Niche,
    language: Language,
    video_context: str | None = None,
) -> ThumbnailOptimization:
    settings = get_settings()
    if not settings.groq_enabled:
        raise GroqThumbnailError("Groq is not configured (missing GROQ_API_KEY)")

    mime = _normalize_mime(mime_type)
    client = AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url=settings.groq_base_url,
        timeout=settings.groq_timeout_seconds,
    )

    user_content: list[dict] = [
        {"type": "text", "text": _user_text(title, niche, language, video_context)},
        {
            "type": "image_url",
            "image_url": {"url": f"data:{mime};base64,{image_b64}"},
        },
    ]

    alt_count = _thumbnail_alternative_count()
    try:
        completion = await client.chat.completions.create(
            model=settings.groq_vision_model,
            messages=[
                {"role": "system", "content": _system_prompt(alt_count)},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
    except APITimeoutError as e:
        raise GroqThumbnailError("Groq vision request timed out") from e
    except APIError as e:
        raise GroqThumbnailError(f"Groq API error: {e}") from e

    content = completion.choices[0].message.content
    if not content:
        raise GroqThumbnailError("Empty response from Groq vision")

    result = _parse_response(content, alt_count)
    logger.info(
        "Groq thumbnail recommendation succeeded (model=%s, niche=%s, on_image_lang=%s)",
        settings.groq_vision_model,
        niche.value,
        result.on_image_text_language,
    )
    return result
