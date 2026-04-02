from fastapi import APIRouter
from schemas.requests import (
    VoteIntentionRequest,
    TrendForecastRequest,
    TurnoutRequest,
)
from models.trend_predictor import (
    predict_vote_intention,
    predict_turnout,
    forecast_trend,
)

router = APIRouter()


@router.post("/vote-intention")
async def predict_vote_intention_endpoint(request: VoteIntentionRequest):
    """Predict vote intention by territory using collected survey responses."""
    result = predict_vote_intention(
        candidate_responses=request.candidate_responses,
        territory_id=request.territory_id,
    )
    return {
        "prediction": result,
        "model_name": "vote_intention",
        "model_version": "1.0.0",
        "confidence": result.get("confidence", 0.0),
        "sample_size": result.get("sample_size", 0),
    }


@router.post("/trend")
async def predict_trend_endpoint(request: TrendForecastRequest):
    """Forecast electoral trend for the next N days."""
    result = forecast_trend(
        time_series=request.time_series,
        periods_ahead=request.periods_ahead,
    )
    return {
        "prediction": result,
        "model_name": "trend_forecast",
        "model_version": "1.0.0",
        "confidence": 0.70,
        "sample_size": len(request.time_series),
    }


@router.post("/turnout")
async def predict_turnout_endpoint(request: TurnoutRequest):
    """Estimate voter turnout for an election."""
    result = predict_turnout(
        historical_turnout=request.historical_turnout,
        registered_voters=request.registered_voters,
        campaign_intensity=request.campaign_intensity,
    )
    return {
        "prediction": result,
        "model_name": "turnout_estimate",
        "model_version": "1.0.0",
        "confidence": result.get("confidence", 0.0),
        "sample_size": request.registered_voters,
    }
