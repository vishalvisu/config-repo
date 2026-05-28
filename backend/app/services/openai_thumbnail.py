import asyncio
import json
import logging

from openai import APIError, APITimeoutError, AsyncOpenAI

from app.config import get_settings
from app.schemas.grader import GeneratedThumbnail, Language, Niche

logger = logging.getLogger(__name__)


class OpenAIThumbnailError(Exception):
    """Raised when OpenAI thumbnail image generation fails."""


_PROMPT_STYLES = [
    "bold photorealistic close-up with expressive face and high contrast",
    "clean graphic layout with large text hook zone and vibrant accent colors",
    "dramatic wide-to-tight crop with single focal subject and dark vignette",
]

_NO_ON_IMAGE_TEXT = frozenset({"none", "no text", "no on-image text", ""})

_GROQ_PROMPT_SYSTEM = """You write DALL-E / image generation prompts for YouTube thumbnails.
Return valid JSON only: {"prompts": ["prompt1", ...]}
Each prompt must be one detailed paragraph for a 16:9 YouTube thumbnail.
Indian creator audience, mobile feed readable, high contrast, no brand logos or watermarks.
On-image text must use ONLY the effective language provided by the user. Do not translate,
romanize, or change language/script from concept hints or the uploaded thumbnail."""


def _effective_thumbnail_language(
    form_language: Language,
    on_image_text_language: str | None,
) -> str:
    if on_image_text_language:
        normalized = on_image_text_language.strip()
        if normalized.lower() not in _NO_ON_IMAGE_TEXT:
            return normalized
    return form_language.value


def _language_source_note(
    form_language: Language,
    on_image_text_language: str | None,
    effective: str,
) -> str:
    if on_image_text_language and on_image_text_language.strip().lower() not in _NO_ON_IMAGE_TEXT:
        return (
            f"Effective on-image text language (from uploaded thumbnail, do not change): "
            f"{effective}"
        )
    return (
        f"Effective on-image text language (from form fallback, do not change): {effective} "
        f"(form field: {form_language.value})"
    )


def _language_rules_suffix(effective: str) -> str:
    return (
        f" All on-image text must be in {effective} only. "
        "Do not translate or switch language/script."
    )


def _template_prompts(
    title: str,
    niche: Niche,
    language: Language,
    video_context: str | None,
    concept_hints: list[str] | None,
    on_image_text_language: str | None = None,
) -> list[str]:
    settings = get_settings()
    count = max(1, settings.thumbnail_gen_count)
    effective = _effective_thumbnail_language(language, on_image_text_language)
    ctx = f" Topic: {video_context}." if video_context else ""
    hints = concept_hints or []
    lang_rules = _language_rules_suffix(effective)
    prompts: list[str] = []
    for i in range(count):
        style = _PROMPT_STYLES[i % len(_PROMPT_STYLES)]
        hint = f" Direction: {hints[i]}." if i < len(hints) else ""
        prompts.append(
            f"YouTube thumbnail for {niche.value} video titled '{title}'.{ctx}{hint} "
            f"Style: {style}. Language for any text overlay: {effective}.{lang_rules} "
            "16:9 composition optimized for small mobile preview."
        )
    return prompts


async def _groq_image_prompts(
    title: str,
    niche: Niche,
    language: Language,
    video_context: str | None,
    concept_hints: list[str] | None,
    on_image_text_language: str | None = None,
) -> list[str]:
    settings = get_settings()
    if not settings.groq_enabled:
        raise OpenAIThumbnailError("Groq not configured for prompt building")

    effective = _effective_thumbnail_language(language, on_image_text_language)
    user_parts = [
        f"Niche: {niche.value}",
        _language_source_note(language, on_image_text_language, effective),
        f"Video title: {title}",
    ]
    if video_context:
        user_parts.append(f"Video context: {video_context}")
    if concept_hints:
        user_parts.append("Concept hints:\n" + "\n".join(f"- {h}" for h in concept_hints))
    user_parts.append(
        f"Return exactly {settings.thumbnail_gen_count} distinct prompts. "
        f"Every prompt must specify on-image text in {effective} only; do not change language."
    )

    client = AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url=settings.groq_base_url,
        timeout=settings.groq_timeout_seconds,
    )

    completion = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": _GROQ_PROMPT_SYSTEM},
            {"role": "user", "content": "\n".join(user_parts)},
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
    )
    content = completion.choices[0].message.content
    if not content:
        raise OpenAIThumbnailError("Empty Groq prompt response")

    data = json.loads(content)
    prompts = data.get("prompts", [])
    if len(prompts) < settings.thumbnail_gen_count:
        raise OpenAIThumbnailError("Groq returned insufficient image prompts")
    return list(prompts[: settings.thumbnail_gen_count])


async def build_image_prompts(
    title: str,
    niche: Niche,
    language: Language,
    video_context: str | None = None,
    concept_hints: list[str] | None = None,
    on_image_text_language: str | None = None,
) -> list[str]:
    try:
        return await _groq_image_prompts(
            title,
            niche,
            language,
            video_context,
            concept_hints,
            on_image_text_language,
        )
    except Exception as e:
        logger.warning("Groq image prompt builder fallback to templates: %s", e)
        return _template_prompts(
            title,
            niche,
            language,
            video_context,
            concept_hints,
            on_image_text_language,
        )


async def _generate_one(prompt: str) -> GeneratedThumbnail:
    settings = get_settings()
    client = AsyncOpenAI(
        api_key=settings.openai_api_key,
        timeout=settings.openai_timeout_seconds,
    )

    kwargs: dict = {
        "model": settings.openai_image_model,
        "prompt": prompt,
        "n": 1,
    }

    kwargs["size"] = settings.openai_image_size
    if settings.openai_image_model.startswith("dall-e"):
        kwargs["response_format"] = "b64_json"
        kwargs["quality"] = "standard"
    else:
        kwargs["output_format"] = "png"

    try:
        response = await client.images.generate(**kwargs)
    except APITimeoutError as e:
        raise OpenAIThumbnailError("OpenAI image request timed out") from e
    except APIError as e:
        raise OpenAIThumbnailError(f"OpenAI image API error: {e}") from e

    if not response.data or not response.data[0].b64_json:
        raise OpenAIThumbnailError("OpenAI returned no image data")

    return GeneratedThumbnail(
        prompt_used=prompt,
        image_base64=response.data[0].b64_json,
    )


async def generate_thumbnails(
    title: str,
    niche: Niche,
    language: Language,
    video_context: str | None = None,
    concept_hints: list[str] | None = None,
    on_image_text_language: str | None = None,
) -> list[GeneratedThumbnail]:
    settings = get_settings()
    if not settings.openai_images_enabled:
        raise OpenAIThumbnailError("OpenAI is not configured (missing OPENAI_API_KEY)")

    effective = _effective_thumbnail_language(language, on_image_text_language)
    logger.debug("Thumbnail image prompts using effective language: %s", effective)

    prompts = await build_image_prompts(
        title,
        niche,
        language,
        video_context,
        concept_hints,
        on_image_text_language,
    )
    results = await asyncio.gather(
        *[_generate_one(p) for p in prompts],
        return_exceptions=True,
    )

    generated: list[GeneratedThumbnail] = []
    errors: list[str] = []
    for result in results:
        if isinstance(result, GeneratedThumbnail):
            generated.append(result)
        elif isinstance(result, Exception):
            errors.append(str(result))

    if not generated:
        raise OpenAIThumbnailError(
            "All thumbnail generations failed: " + "; ".join(errors[:3])
        )

    if errors:
        logger.warning("Some thumbnail generations failed: %s", errors)

    logger.info("OpenAI generated %d thumbnail(s)", len(generated))
    return generated
