"""
Sentiment analysis model for Dominican political survey responses.
Uses TextBlob for baseline Spanish sentiment with political domain adaptation.
"""

from textblob import TextBlob
from textblob.translate import NotTranslated


POSITIVE_POLITICAL_KEYWORDS = {
    "excelente", "bueno", "mejor", "progreso", "desarrollo", "apoyo",
    "confianza", "seguro", "estable", "bienestar", "crecimiento",
}

NEGATIVE_POLITICAL_KEYWORDS = {
    "malo", "peor", "corrupto", "corrupción", "inseguro", "peligroso",
    "desempleo", "pobreza", "crisis", "problema", "fracaso", "incompetente",
}


def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of a Spanish text response.

    Returns:
        dict with keys: score (-1 to 1), polarity, subjectivity, keywords
    """
    if not text or not text.strip():
        return {
            "score": 0.0,
            "polarity": "neutral",
            "subjectivity": 0.0,
            "keywords": [],
        }

    try:
        blob = TextBlob(text)
        base_score: float = blob.sentiment.polarity  # type: ignore[union-attr]
        subjectivity: float = blob.sentiment.subjectivity  # type: ignore[union-attr]
    except (NotTranslated, Exception):
        base_score = 0.0
        subjectivity = 0.0

    # Domain-specific keyword adjustment
    words = set(text.lower().split())
    positive_matches = words & POSITIVE_POLITICAL_KEYWORDS
    negative_matches = words & NEGATIVE_POLITICAL_KEYWORDS

    keyword_adjustment = (len(positive_matches) - len(negative_matches)) * 0.1
    final_score = max(-1.0, min(1.0, base_score + keyword_adjustment))

    if final_score > 0.1:
        polarity = "positive"
    elif final_score < -0.1:
        polarity = "negative"
    else:
        polarity = "neutral"

    return {
        "score": round(final_score, 4),
        "polarity": polarity,
        "subjectivity": round(subjectivity, 4),
        "keywords": list(positive_matches | negative_matches),
    }


def batch_analyze_sentiment(texts: list[str]) -> list[dict]:
    """Analyze sentiment for a batch of texts."""
    return [analyze_sentiment(t) for t in texts]
