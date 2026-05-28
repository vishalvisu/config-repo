import asyncio
import base64
import hashlib
import logging

from app.schemas.grader import (
    CtrGrade,
    GraderAnalyzeResponse,
    GraderScores,
    GraderSummary,
    Language,
    Niche,
    ThumbnailOptimization,
    TitleOptimization,
    VisualCritique,
)
from app.config import get_settings
from app.services.groq_thumbnail import recommend_thumbnail
from app.services.groq_title import optimize_title
from app.services.openai_thumbnail import OpenAIThumbnailError, generate_thumbnails

logger = logging.getLogger(__name__)

_NICHE_LABEL: dict[Niche, str] = {
    Niche.TECH: "Tech",
    Niche.GAMING: "Gaming",
    Niche.FINANCE: "Finance",
    Niche.VLOGS: "Vlogs",
    Niche.COMEDY: "Comedy",
    Niche.INFOTAINMENT: "Infotainment",
}

_LANG_TAGS: dict[Language, str] = {
    Language.ENGLISH: "⚡",
    Language.HINGLISH: "🔥",
    Language.PURE_HINDI: "🇮🇳",
    Language.TAMIL: "🪷",
    Language.TELUGU: "🌶️",
    Language.BENGALI: "🐯",
    Language.MARATHI: "🚩",
    Language.KANNADA: "💛",
    Language.MALAYALAM: "🌴",
    Language.GUJARATI: "🪔",
    Language.PUNJABI: "🌾",
    Language.ODIA: "🏛️",
    Language.OTHER_REGIONAL: "📍",
}

_ENGLISH_TEMPLATES: dict[Niche, list[str]] = {
    Niche.TECH: [
        "⚡ 99% of People Miss This {n} Feature!",
        "⚡ Hidden Phone Setting — Try This Now",
        "⚡ The {n} Hack That Tripled My Views",
    ],
    Niche.GAMING: [
        "⚡ Boss Fight Secret — Revealed for the First Time!",
        "⚡ Pro Players Use These Settings",
        "⚡ Game Over? Not With This Trick",
    ],
    Niche.FINANCE: [
        "⚡ Don't Make This SIP Mistake",
        "⚡ Save Money: Desi Formula With Proof",
        "⚡ Stock Market Rule #1 for Beginners",
    ],
    Niche.VLOGS: [
        "⚡ Why Was Today So Crazy?",
        "⚡ Real Street Moment — Watch Till End",
        "⚡ My Family Did NOT Expect This",
    ],
    Niche.COMEDY: [
        "⚡ When Mom Took My Phone…",
        "⚡ Relatives Roast — Part 2 Incoming",
        "⚡ This Was NOT in the Script",
    ],
    Niche.INFOTAINMENT: [
        "⚡ 3 Facts School Never Taught You",
        "⚡ History Twist — Shocking Ending",
        "⚡ Science + Masala = Perfect Watch",
    ],
}

_HINGLISH_TEMPLATES: dict[Niche, list[str]] = {
    Niche.TECH: [
        "🔥 Ye Feature 99% Log Miss Kar Rahe Hain!",
        "🔥 Phone Mein Hidden Setting — Ab Try Karo",
        "🔥 Tech Hack Jo Mujhe Views Dila Raha Hai",
    ],
    Niche.GAMING: [
        "🔥 Boss Fight Ka Secret — Pehli Baar Reveal!",
        "🔥 Pro Players Ye Settings Use Karte Hain",
        "🔥 Game Over? Nahi — Ye Trick Dekho",
    ],
    Niche.FINANCE: [
        "🔥 SIP Se Pehle Ye Galti Mat Karna",
        "🔥 Paisa Bachane Ka Desi Formula — Proof Ke Saath",
        "🔥 Stock Market Mein Beginners Ka #1 Rule",
    ],
    Niche.VLOGS: [
        "🔥 Aaj Ka Din Itna Crazy Kyun Tha?",
        "🔥 Mumbai Streets Pe Real Moment — Dekho",
        "🔥 Family Ne Ye Expect Nahi Kiya Tha 😅",
    ],
    Niche.COMEDY: [
        "🔥 Mummy Ne Jab Phone Le Liya… 💀",
        "🔥 Relatives Ka Roast — Part 2 Incoming",
        "🔥 Ye Scene Script Mein Nahi Tha",
    ],
    Niche.INFOTAINMENT: [
        "🔥 3 Facts Jo School Ne Kabhi Nahi Bataye",
        "🔥 History Ka Twist — Ending Shock Hai",
        "🔥 Science + Masala = Perfect Watch",
    ],
}

# Format: tag, niche label — three hooks per language (romanized / mixed for staging)
_INDIAN_PHRASES: dict[Language, list[str]] = {
    Language.TAMIL: [
        "{tag} {n} Video-la 99% Per Ithai Miss Panranga!",
        "{tag} {n} Secret — Mudhal Murai Full-a Reveal!",
        "{tag} Indha {n} Trick Views Ah Thookitu Pogum!",
    ],
    Language.TELUGU: [
        "{tag} {n} Lo 99% Mandhi Iddhi Miss Avtunnaru!",
        "{tag} {n} Secret — Motham First Time Reveal!",
        "{tag} Ee {n} Trick Views Penchutundi!",
    ],
    Language.BENGALI: [
        "{tag} {n} Te 99% Lok Eta Miss Korche!",
        "{tag} {n} Er Secret — Prothom Bar Full Reveal!",
        "{tag} Ei {n} Trick Views Barachhe!",
    ],
    Language.MARATHI: [
        "{tag} {n} Madhe 99% Lok Hé Miss Kart Ahet!",
        "{tag} {n} Cha Secret — Pahilenda Full Reveal!",
        "{tag} Hā {n} Trick Views Vadhavte!",
    ],
    Language.KANNADA: [
        "{tag} {n} Alli 99% Janaru Idannu Miss Maaduttare!",
        "{tag} {n} Secret — Modala Sala Full Reveal!",
        "{tag} Ee {n} Trick Views Huchchuttade!",
    ],
    Language.MALAYALAM: [
        "{tag} {n} Il 99% Aalukal Ith Miss Cheyyunnu!",
        "{tag} {n} Secret — Aadhyamayi Full Reveal!",
        "{tag} Ee {n} Trick Views Kuthikkum!",
    ],
    Language.GUJARATI: [
        "{tag} {n} Ma 99% Loko Aa Miss Kare Che!",
        "{tag} {n} Nu Secret — Pehli Vaar Full Reveal!",
        "{tag} Aa {n} Trick Views Vadhare!",
    ],
    Language.PUNJABI: [
        "{tag} {n} Vich 99% Lok Eh Miss Kar Rahe Ne!",
        "{tag} {n} Da Secret — Pehli Vaar Full Reveal!",
        "{tag} Eh {n} Trick Views Vadhaunda Hai!",
    ],
    Language.ODIA: [
        "{tag} {n} Re 99% Loka Eta Miss Karuchhanti!",
        "{tag} {n} Ra Secret — Prathama Thara Full Reveal!",
        "{tag} Ei {n} Trick Views Badhaei!",
    ],
}


def _seed(*parts: str | int) -> int:
    payload = "|".join(str(p) for p in parts)
    digest = hashlib.sha256(payload.encode()).hexdigest()
    return int(digest[:8], 16)


def _score_from_seed(seed: int, offset: int, low: int = 45, high: int = 98) -> int:
    span = high - low + 1
    return low + ((seed + offset * 7919) % span)


def _ctr_grade(avg: float) -> CtrGrade:
    if avg >= 85:
        return "A"
    if avg >= 70:
        return "B"
    if avg >= 55:
        return "C"
    if avg >= 40:
        return "D"
    return "F"


def _lang_tag(language: Language) -> str:
    return _LANG_TAGS[language]


def _format_hooks(templates: list[str], niche: Niche, tag: str) -> list[str]:
    label = _NICHE_LABEL[niche]
    return [t.format(n=label, tag=tag) for t in templates]


def _english_hooks(niche: Niche) -> list[str]:
    return _format_hooks(_ENGLISH_TEMPLATES[niche], niche, _lang_tag(Language.ENGLISH))


def _hinglish_hooks(niche: Niche, tag: str) -> list[str]:
    templates = _HINGLISH_TEMPLATES[niche]
    if tag == "🔥":
        return list(templates)
    return [t.replace("🔥", tag, 1) for t in templates]


def _hindi_hooks(niche: Niche) -> list[str]:
    tag = _lang_tag(Language.PURE_HINDI)
    hindi_templates: dict[Niche, list[str]] = {
        Niche.TECH: [
            "ये फीचर 99% लोग मिस कर रहे हैं!",
            "फोन की छुपी सेटिंग — अभी आज़माएँ",
            "टेक हैक जिससे व्यूज़ बढ़े",
        ],
        Niche.GAMING: [
            "बॉस फाइट का राज़ — पहली बार!",
            "प्रो खिलाड़ी ये सेटिंग्स इस्तेमाल करते हैं",
            "गेम ओवर? नहीं — ये ट्रिक देखें",
        ],
        Niche.FINANCE: [
            "SIP से पहले ये गलती न करें",
            "पैसा बचाने का देसी फॉर्मूला",
            "शेयर बाज़ार नियम #1",
        ],
        Niche.VLOGS: [
            "आज का दिन इतना क्रेज़ी क्यों?",
            "गली का असली पल — देखें",
            "परिवार ने ये उम्मीद नहीं की थी",
        ],
        Niche.COMEDY: [
            "जब मम्मी ने फोन ले लिया…",
            "रिश्तेदारों का रोस्ट — पार्ट 2",
            "ये सीन स्क्रिप्ट में नहीं था",
        ],
        Niche.INFOTAINMENT: [
            "3 फैक्ट जो स्कूल ने नहीं बताए",
            "इतिहास का ट्विस्ट — शॉकिंग",
            "साइंस + मसाला = परफेक्ट",
        ],
    }
    return [f"{tag} {t}" for t in hindi_templates[niche]]


def _indian_language_hooks(niche: Niche, language: Language) -> list[str]:
    tag = _lang_tag(language)
    label = _NICHE_LABEL[niche]
    phrases = _INDIAN_PHRASES[language]
    return [p.format(tag=tag, n=label) for p in phrases]


def _niche_hooks(niche: Niche, language: Language) -> list[str]:
    if language == Language.ENGLISH:
        return _english_hooks(niche)
    if language == Language.PURE_HINDI:
        return _hindi_hooks(niche)
    if language in _INDIAN_PHRASES:
        return _indian_language_hooks(niche, language)
    if language == Language.OTHER_REGIONAL:
        return _hinglish_hooks(niche, _lang_tag(Language.OTHER_REGIONAL))
    return _hinglish_hooks(niche, _lang_tag(Language.HINGLISH))


def _feedback_for_language(language: Language, grade: str) -> str:
    if language == Language.ENGLISH:
        feedback_by_grade = {
            "A": "Thumbnail and title are strong on mobile. Curiosity hook is clear — publish-ready staging grade.",
            "B": "Solid base; bump contrast or title punch to improve CTR further.",
            "C": "Average packaging — readability or hook needs one clear upgrade.",
            "D": "Elements clash on mobile; title feels generic.",
            "F": "Won't stop the scroll — rework thumbnail text and title.",
        }
    else:
        feedback_by_grade = {
            "A": "Thumbnail aur title dono mobile feed ke liye strong hain. Curiosity hook clear hai — publish-ready staging grade.",
            "B": "Solid base hai; thoda contrast ya title punch badhaoge to CTR aur improve hoga.",
            "C": "Average packaging — text readability ya hook mein ek clear upgrade chahiye.",
            "D": "Mobile par elements clash kar rahe hain; title bhi generic lag raha hai.",
            "F": "Feed par scroll-stop nahi hoga — thumbnail text aur title dono rework karo.",
        }
    return feedback_by_grade[grade]


_THUMBNAIL_CONCEPTS: dict[Niche, list[str]] = {
    Niche.TECH: [
        "Close-up of phone screen with one bold Hinglish hook; dark gradient background, yellow outline on text, face reaction on the right third.",
        "Split frame: before/after settings screenshot; huge 3-word headline on left, high contrast white on navy.",
        "Single hero gadget with red arrow pointing to hidden feature; minimal text, face showing shock expression.",
    ],
    Niche.GAMING: [
        "Boss character fill frame with neon red 'SECRET?' text; darken edges, brighten face, max 4 words.",
        "Dual monitor layout: settings panel zoom + pro player facecam; green accent border for gaming vibe.",
        "Victory moment freeze-frame; oversized bold text top-left, blurred gameplay background.",
    ],
    Niche.FINANCE: [
        "Worried salaried person left, SIP/chart graphic right; bold 'GALTI?' on high-contrast yellow bar.",
        "RBI/news headline style: newspaper texture background, 3-word hook in white on red strip.",
        "Calculator + rupee notes flat lay; one short Devanagari/Hinglish hook, dark vignette for readability.",
    ],
    Niche.VLOGS: [
        "Candid street moment, subject large in frame; handwritten-style hook text with white stroke.",
        "Family reaction shot, warm tones; single question hook in top band with shadow behind text.",
        "Wide shot cropped tight for mobile; arrow pointing to unexpected moment, 3-word hook only.",
    ],
    Niche.COMEDY: [
        "Exaggerated facial expression center frame; comic bold text with black outline, bright solid background.",
        "Relatives group shot cropped tight; speech bubble style hook, high saturation.",
        "Phone-in-hand disaster moment; emoji-free, 2-word punchline in contrasting block color.",
    ],
    Niche.INFOTAINMENT: [
        "Historical figure or prop large in frame; parchment-style hook band at bottom, sepia + high contrast text.",
        "Three-icon row with one big number '3'; clean background, single curiosity hook.",
        "Split: map/graphic + presenter pointing; electric blue accent, max 4 words on thumbnail.",
    ],
}


def _mock_thumbnail_optimization(
    niche: Niche,
    language: Language,
    flaw: str,
    fix: str,
) -> ThumbnailOptimization:
    count = max(1, get_settings().thumbnail_gen_count)
    concepts = [c for c in _THUMBNAIL_CONCEPTS[niche]][:count]
    if language == Language.ENGLISH:
        concepts = [
            c.replace("Hinglish hook", "English hook").replace(
                "Devanagari/Hinglish", "English"
            )
            for c in concepts
        ]
    return ThumbnailOptimization(
        flaw=flaw,
        fix=fix,
        thumbnail_alternatives=concepts,
        on_image_text_language=None,
    )


def _title_flaw_for_language(language: Language, title: str) -> str:
    if language == Language.ENGLISH:
        return (
            "Weak curiosity gap — viewers can't tell what happened or what they'll get."
            if len(title) < 40
            else "Title is long; the hook may appear late on mobile feed."
        )
    return (
        "Title mein curiosity gap weak hai — viewer ko 'kya hua / kya milega' clear nahi."
        if len(title) < 40
        else "Title lamba hai; mobile feed par hook late dikh sakta hai."
    )


def build_mock_response(
    title: str,
    niche: Niche,
    language: Language,
    image_size: int,
) -> GraderAnalyzeResponse:
    seed = _seed(title, niche.value, language.value, image_size)

    text_contrast = _score_from_seed(seed, 1)
    mobile_legibility = _score_from_seed(seed, 2)
    curiosity_score = _score_from_seed(seed, 3)
    avg = (text_contrast + mobile_legibility + curiosity_score) / 3
    grade = _ctr_grade(avg)

    visual_by_grade = {
        "A": (
            "Minor polish possible on edge contrast.",
            "Optional: 2px outer stroke on hero text for OLED screens.",
        ),
        "B": (
            "Text slightly competes with background on small screens.",
            "Increase text-background separation with darker vignette behind headline.",
        ),
        "C": (
            "Multiple focal points dilute the main hook.",
            "Single hero face/object + one bold phrase only.",
        ),
        "D": (
            "Small text and busy background hurt legibility at 120px width.",
            "Use fewer words, larger type, and high-contrast block behind text.",
        ),
        "F": (
            "Critical elements likely hidden at mobile thumbnail size.",
            "Redesign for 120px: max 3–4 words, one face, high contrast palette.",
        ),
    }

    alternatives = list(_niche_hooks(niche, language))
    if title.strip():
        short = title.strip()[:35]
        prefix = alternatives[0].split(" ", 1)[0]
        alternatives[0] = f"{prefix} {short}…?"

    flaw, fix = visual_by_grade[grade]

    return GraderAnalyzeResponse(
        summary=GraderSummary(
            ctr_grade=grade,
            overall_feedback=_feedback_for_language(language, grade),
        ),
        scores=GraderScores(
            text_contrast=text_contrast,
            mobile_legibility=mobile_legibility,
            curiosity_score=curiosity_score,
        ),
        visual_critique=VisualCritique(flaw=flaw, fix=fix),
        title_optimization=TitleOptimization(
            flaw=_title_flaw_for_language(language, title),
            hinglish_alternatives=alternatives,
        ),
        thumbnail_optimization=_mock_thumbnail_optimization(
            niche, language, flaw, fix
        ),
    )


async def analyze_submission(
    title: str,
    niche: Niche,
    language: Language,
    image_bytes: bytes,
    content_type: str | None,
    video_context: str | None = None,
) -> tuple[str, GraderAnalyzeResponse]:
    b64 = base64.b64encode(image_bytes).decode("ascii")
    response = build_mock_response(title, niche, language, len(image_bytes))

    title_result, thumb_result = await asyncio.gather(
        optimize_title(title, niche, language, video_context=video_context),
        recommend_thumbnail(
            b64,
            content_type,
            title,
            niche,
            language,
            video_context=video_context,
        ),
        return_exceptions=True,
    )

    if isinstance(title_result, TitleOptimization):
        response.title_optimization = title_result
        logger.debug("Title optimization: Groq")
    elif isinstance(title_result, Exception):
        logger.warning("Title optimization: template fallback (%s)", title_result)

    if isinstance(thumb_result, ThumbnailOptimization):
        response.thumbnail_optimization = thumb_result
        response.visual_critique = VisualCritique(
            flaw=thumb_result.flaw,
            fix=thumb_result.fix,
        )
        logger.debug("Thumbnail optimization: Groq vision")
    elif isinstance(thumb_result, Exception):
        logger.warning(
            "Thumbnail optimization: template fallback (%s)", thumb_result
        )

    settings = get_settings()
    if settings.openai_images_enabled:
        try:
            thumb_opt = response.thumbnail_optimization
            generated = await generate_thumbnails(
                title=title,
                niche=niche,
                language=language,
                video_context=video_context,
                concept_hints=thumb_opt.thumbnail_alternatives,
                on_image_text_language=thumb_opt.on_image_text_language,
            )
            response.thumbnail_optimization.generated_thumbnails = generated
            logger.debug("Thumbnail images: OpenAI (%d)", len(generated))
        except OpenAIThumbnailError as e:
            logger.warning("Thumbnail image generation: fallback to text (%s)", e)

    return b64, response
