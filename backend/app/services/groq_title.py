import json
import logging

from openai import APIError, APITimeoutError, AsyncOpenAI

from app.config import get_settings
from app.schemas.category import VideoCategory
from app.schemas.grader import Language, TitleOptimization

logger = logging.getLogger(__name__)


class GroqTitleError(Exception):
    """Raised when Groq title optimization fails."""


SYSTEM_PROMPT = """You are an expert YouTube packaging strategist for Indian creators.
Optimize video titles for mobile feed CTR: short hooks, curiosity gaps, culturally resonant phrasing.

You MUST respond with valid JSON only (no markdown), exactly this shape:
{
  "flaw": "one specific issue with the user's draft title",
  "hinglish_alternatives": ["alternative 1", "alternative 2", "alternative 3"]
}

Rules:
- Provide exactly 3 alternatives in hinglish_alternatives (field name is fixed for API compatibility).
- Write ALL text (flaw + alternatives) in the target language requested by the user.
- For Hinglish: natural Hindi-English mix as used on Indian YouTube.
- For Pure Hindi: Devanagari script.
- For Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia: use that language (native script or common romanized YouTube style for that audience).
- For English: English only.
- For Other Regional: neutral Indian creator tone, avoid forcing Hinglish unless it fits.
- Alternatives must differ from each other and from the draft; max ~70 characters each.
- Do not include labels like "Option 1" in the strings.
- When video context is provided, alternatives must reflect that topic accurately."""


def _user_prompt(
    title: str,
    category: VideoCategory,
    language: Language,
    video_context: str | None = None,
) -> str:
    parts = [
        f"Category: {category.value}",
        f"Target language: {language.value}",
        f"Draft title: {title}",
    ]
    if video_context:
        parts.append(f"\nVideo context (what the video is about):\n{video_context}")
        parts.append(
            "\nUse the video context to make hooks accurate and specific. "
            "Do not contradict the draft title or context."
        )
    parts.append("\nAnalyze the draft and return flaw plus 3 stronger title alternatives.")
    return "\n".join(parts)


def _parse_response(content: str) -> TitleOptimization:
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise GroqTitleError(f"Invalid JSON from Groq: {e}") from e

    try:
        return TitleOptimization.model_validate(data)
    except Exception as e:
        raise GroqTitleError(f"Response validation failed: {e}") from e


async def optimize_title(
    title: str,
    category: VideoCategory,
    language: Language,
    video_context: str | None = None,
) -> TitleOptimization:
    settings = get_settings()
    if not settings.groq_enabled:
        raise GroqTitleError("Groq is not configured (missing GROQ_API_KEY)")

    client = AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url=settings.groq_base_url,
        timeout=settings.groq_timeout_seconds,
    )

    try:
        completion = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": _user_prompt(
                        title, category, language, video_context
                    ),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
    except APITimeoutError as e:
        raise GroqTitleError("Groq request timed out") from e
    except APIError as e:
        raise GroqTitleError(f"Groq API error: {e}") from e

    content = completion.choices[0].message.content
    if not content:
        raise GroqTitleError("Empty response from Groq")

    result = _parse_response(content)
    logger.info(
        "Groq title optimization succeeded (model=%s, language=%s, category=%s)",
        settings.groq_model,
        language.value,
        category.value,
    )
    return result
