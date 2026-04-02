from fastapi import APIRouter
from schemas.requests import (
    SentimentRequest,
    ClusteringRequest,
    AnomalyRequest,
)
from models.sentiment import batch_analyze_sentiment
from models.geo_clustering import dbscan_clustering, detect_anomalies

router = APIRouter()


@router.post("/sentiment")
async def analyze_sentiment_endpoint(request: SentimentRequest):
    """Analyze sentiment of open-text survey responses."""
    results = batch_analyze_sentiment(request.texts)
    avg_score = sum(r["score"] for r in results) / len(results) if results else 0.0

    return {
        "results": results,
        "summary": {
            "total": len(results),
            "avg_score": round(avg_score, 4),
            "positive": sum(1 for r in results if r["polarity"] == "positive"),
            "negative": sum(1 for r in results if r["polarity"] == "negative"),
            "neutral": sum(1 for r in results if r["polarity"] == "neutral"),
        },
        "model": "textblob_political_do",
        "version": "1.0.0",
    }


@router.post("/clustering")
async def cluster_responses_endpoint(request: ClusteringRequest):
    """Cluster survey responses by geospatial proximity."""
    result = dbscan_clustering(
        points=request.points,
        eps_km=request.eps_km,
        min_samples=request.min_samples,
        value_field=request.value_field,
    )
    return result


@router.post("/anomalies")
async def detect_anomalies_endpoint(request: AnomalyRequest):
    """Detect anomalous field data entries."""
    result = detect_anomalies(
        responses=request.responses,
        threshold_std=request.threshold_std,
    )
    return result
