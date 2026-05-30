from enum import StrEnum

from app.schemas.grader import Niche


class VideoCategory(StrEnum):
    """Unified category options shared by packaging and script checkers."""

    TECH = "Tech"
    GAMING = "Gaming"
    FINANCE = "Finance"
    COMEDY = "Comedy"
    INFOTAINMENT = "Infotainment"
    TUTORIAL = "Tutorial"
    REVIEW = "Review"
    UNBOXING = "Unboxing"
    VLOG = "Vlog"
    STORY = "Story"
    COMMENTARY = "Commentary"
    EXPLAINER = "Explainer"
    ENTERTAINMENT = "Entertainment"
    PODCASTS = "Podcasts"
    TRAVEL = "Travel"
    BUSINESS_STARTUPS = "Business & Startups"
    FITNESS_HEALTH = "Fitness & Health"
    CAREER_EDUCATION = "Career & Education"
    AUTOMOBILE = "Automobile"
    GEEK_CULTURE = "Geek Culture"
    FASHION_LIFESTYLE = "Fashion & Lifestyle"
    NEWS = "News"
    DISCUSSION = "Discussion"


_GENRE_TO_NICHE: dict[VideoCategory, Niche] = {
    VideoCategory.TUTORIAL: Niche.TECH,
    VideoCategory.REVIEW: Niche.TECH,
    VideoCategory.UNBOXING: Niche.TECH,
    VideoCategory.AUTOMOBILE: Niche.TECH,
    VideoCategory.VLOG: Niche.VLOGS,
    VideoCategory.STORY: Niche.VLOGS,
    VideoCategory.TRAVEL: Niche.VLOGS,
    VideoCategory.FASHION_LIFESTYLE: Niche.VLOGS,
    VideoCategory.COMMENTARY: Niche.INFOTAINMENT,
    VideoCategory.EXPLAINER: Niche.INFOTAINMENT,
    VideoCategory.ENTERTAINMENT: Niche.COMEDY,
    VideoCategory.PODCASTS: Niche.INFOTAINMENT,
    VideoCategory.BUSINESS_STARTUPS: Niche.FINANCE,
    VideoCategory.FITNESS_HEALTH: Niche.INFOTAINMENT,
    VideoCategory.CAREER_EDUCATION: Niche.INFOTAINMENT,
    VideoCategory.GEEK_CULTURE: Niche.GAMING,
    VideoCategory.NEWS: Niche.INFOTAINMENT,
    VideoCategory.DISCUSSION: Niche.INFOTAINMENT,
}


def category_to_niche(category: VideoCategory) -> Niche:
    """Map unified category to legacy niche templates for grader fallbacks."""
    try:
        return Niche(category.value)
    except ValueError:
        return _GENRE_TO_NICHE[category]
