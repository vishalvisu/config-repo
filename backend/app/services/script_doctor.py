import json
import logging
import re

from openai import APIError, APITimeoutError, AsyncOpenAI

from app.config import get_settings
from app.schemas.script import (
    BoredomZone,
    HookAnalysis,
    PacingStyle,
    ScriptDoctorResponse,
)

logger = logging.getLogger(__name__)


class ScriptDoctorError(Exception):
    """Raised when script analysis fails."""


SYSTEM_PROMPT = """You are a Hook-to-Retention Video Script Doctor for Indian YouTube creators.
Analyze spoken-word video scripts for hook strength, pacing, and retention risk zones.

The user provides TEXT ONLY — no video file and no timestamps. Never invent mm:ss timestamps.

Respond with valid JSON only (no markdown), exactly this shape:
{
  "hook": {
    "dikkat": "specific critique of the opening hook",
    "kya_badlo": "brief instruction + quoted concrete hook rewrite, e.g. For example, '...'",
    "hook_score": 0-100
  },
  "retention_score": 0-100,
  "overall_feedback": "2-3 sentence summary of script retention potential",
  "pacing_feedback": "how well the script matches the requested pacing style",
  "boredom_zones": [
    {
      "zone_label": "Sentences 3–7",
      "start_sentence": 3,
      "end_sentence": 7,
      "start_seconds": null,
      "end_seconds": null,
      "dikkat": "what causes drop-off in this segment",
      "kya_badlo": "brief instruction + quoted concrete rewrite for this segment, e.g. For example, '...'"
    }
  ]
}

Rules:
- Identify 1-5 boredom_zones where pacing drags, repetition occurs, or payoff is delayed.
- dikkat = problem (DIKKAT); kya_badlo = actionable rewrite (KYA BADLO).
- Every kya_badlo (hook and each boredom zone) MUST include one concrete quoted rewrite
  the creator can paste into their script. Use brief instruction + a quoted example in
  '...', \"...\", or phrasing like For example, '...', like '...', or such as '...'.
- Never return kya_badlo as advice-only with no quoted sample.
- Reference every boredom zone by sentence numbers from the numbered script (zone_label like "Sentences 3–7").
- Set start_sentence and end_sentence to match zone_label; start_seconds and end_seconds must always be null.
- Hook analysis must focus on sentences 1–3 (the opening), not video timestamps.
- Match feedback to pacing_style: Fast = tight hooks, no filler; Balanced = mix;
  Storytelling = emotional arc; Tutorial = clear steps, early value promise.
- Use Hinglish-friendly tone when the script mixes Hindi and English; otherwise match script language.
- hook_score and retention_score must be integers 0-100."""


def _split_sentences(script_text: str) -> list[str]:
    """Split script into sentences for numbering."""
    text = script_text.strip()
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [part.strip() for part in parts if part.strip()]


def _numbered_script(script_text: str) -> tuple[str, int]:
    """Return numbered script block and total sentence count."""
    sentences = _split_sentences(script_text)
    if not sentences:
        return script_text.strip(), 1
    numbered = "\n".join(f"[{i}] {sentence}" for i, sentence in enumerate(sentences, start=1))
    return numbered, len(sentences)


def _user_prompt(script_text: str, pacing_style: PacingStyle) -> str:
    numbered, sentence_count = _numbered_script(script_text)
    return (
        f"Pacing style: {pacing_style.value}\n\n"
        "Text-only script (no video). "
        f"Total sentences: {sentence_count}.\n"
        "Use sentence numbers from the numbered script below for all boredom_zones.\n\n"
        f"Numbered script:\n{numbered}\n\n"
        "Analyze hook (sentences 1–3), retention, and boredom zones. Return JSON only.\n"
        "Every kya_badlo must include a quoted concrete rewrite example (not advice-only)."
    )


def _parse_response(content: str) -> ScriptDoctorResponse:
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise ScriptDoctorError(f"Invalid JSON from model: {e}") from e

    try:
        return ScriptDoctorResponse.model_validate(data)
    except Exception as e:
        raise ScriptDoctorError(f"Response validation failed: {e}") from e


def _resolve_llm() -> tuple[AsyncOpenAI, str, str]:
    """Return (client, model, provider_label). Priority: OpenRouter > Groq > OpenAI."""
    settings = get_settings()
    timeout = settings.script_doctor_timeout_seconds

    if settings.openrouter_enabled:
        return (
            AsyncOpenAI(
                api_key=settings.openrouter_api_key,
                base_url=settings.openrouter_base_url,
                timeout=timeout,
            ),
            settings.openrouter_model,
            "openrouter",
        )

    if settings.groq_enabled:
        return (
            AsyncOpenAI(
                api_key=settings.groq_api_key,
                base_url=settings.groq_base_url,
                timeout=timeout,
            ),
            settings.groq_model,
            "groq",
        )

    if settings.openai_text_enabled:
        return (
            AsyncOpenAI(
                api_key=settings.openai_api_key,
                timeout=timeout,
            ),
            settings.openai_text_model,
            "openai",
        )

    raise ScriptDoctorError(
        "No LLM configured (set OPENROUTER_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY)"
    )


def _template_response(
    script_text: str, pacing_style: PacingStyle
) -> ScriptDoctorResponse:
    """Heuristic fallback when AI is unavailable or fails."""
    words = script_text.split()
    word_count = len(words)
    sentence_count = max(1, len(_split_sentences(script_text)))
    first_block = " ".join(words[:80])
    long_paragraphs = len(re.findall(r"\n\s*\n", script_text)) == 0 and word_count > 400

    hook_score = 55 if word_count > 30 else 40
    retention_score = 50
    if word_count < 200:
        retention_score = 62
    elif long_paragraphs:
        retention_score = 42

    hook = HookAnalysis(
        dikkat=(
            "Opening mein clear hook ya curiosity gap nahi dikhta — "
            "viewer ko turant reason nahi milta ki kyun dekhein."
        ),
        kya_badlo=(
            "Pehle 1–2 sentences mein bold promise daalo: "
            "“Aaj aap seekhenge…” ya “Ye galti 90% log karte hain…” — "
            f"phir apna topic introduce karo. (Style: {pacing_style.value})"
        ),
        hook_score=hook_score,
    )

    mid_start = max(2, sentence_count // 3)
    mid_end = min(sentence_count, mid_start + max(2, sentence_count // 4))
    late_start = max(mid_end + 1, (sentence_count * 2) // 3)
    late_end = sentence_count

    zones: list[BoredomZone] = []
    if long_paragraphs and sentence_count >= 4:
        zones.append(
            BoredomZone(
                zone_label=f"Sentences {mid_start}–{mid_end}",
                start_sentence=mid_start,
                end_sentence=mid_end,
                dikkat="Bahut lamba continuous block — mobile viewers ke liye heavy lag sakta hai.",
                kya_badlo=(
                    "Har few sentences ke baad chhota payoff add karo — "
                    "jaise 'Toh yahan pe sab kuch change ho jata hai…' ya ek quick question pucho."
                ),
            )
        )
    if sentence_count >= 8 and late_start < late_end:
        zones.append(
            BoredomZone(
                zone_label=f"Sentences {late_start}–{late_end}",
                start_sentence=late_start,
                end_sentence=late_end,
                dikkat="Script mein late payoff — climax ya main reveal bahut peeche hai.",
                kya_badlo=(
                    "Main value peeche shift karo — "
                    "jaise 'Ab sabse important part — yahi hai jo aap wait kar rahe the.'"
                ),
            )
        )
    if not zones:
        zones.append(
            BoredomZone(
                zone_label=f"Sentences 1–{min(3, sentence_count)}",
                start_sentence=1,
                end_sentence=min(3, sentence_count),
                dikkat=f"Pacing style '{pacing_style.value}' ke hisaab se transitions check karo.",
                kya_badlo=(
                    "Filler lines hatao — "
                    "jaise 'Next up, ye step aapke workflow ko completely change karega.'"
                ),
            )
        )

    return ScriptDoctorResponse(
        hook=hook,
        retention_score=retention_score,
        overall_feedback=(
            f"Template analysis ({word_count} words, {sentence_count} sentences). "
            "AI unavailable — configure OPENROUTER_API_KEY or GROQ_API_KEY for deeper review. "
            f"Sample opening: “{first_block[:120]}…”"
        ),
        pacing_feedback=(
            f"Requested style: {pacing_style.value}. "
            "Break long sections and front-load the hook for Indian mobile viewers."
        ),
        boredom_zones=zones,
    )


async def analyze_script(
    script_text: str, pacing_style: PacingStyle
) -> ScriptDoctorResponse:
    settings = get_settings()

    if not (
        settings.openrouter_enabled
        or settings.groq_enabled
        or settings.openai_text_enabled
    ):
        logger.warning("Script Doctor: no LLM key — using template fallback")
        return _template_response(script_text, pacing_style)

    client, model, provider = _resolve_llm()

    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": _user_prompt(script_text, pacing_style),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
    except APITimeoutError:
        logger.warning("Script Doctor %s timeout — using template fallback", provider)
        return _template_response(script_text, pacing_style)
    except APIError as e:
        logger.warning(
            "Script Doctor %s API error: %s — using template fallback", provider, e
        )
        return _template_response(script_text, pacing_style)

    content = completion.choices[0].message.content
    if not content:
        logger.warning("Script Doctor empty response — using template fallback")
        return _template_response(script_text, pacing_style)

    try:
        result = _parse_response(content)
    except ScriptDoctorError:
        logger.warning("Script Doctor parse failed — using template fallback")
        return _template_response(script_text, pacing_style)

    logger.info("Script Doctor succeeded (provider=%s, model=%s)", provider, model)
    return result
