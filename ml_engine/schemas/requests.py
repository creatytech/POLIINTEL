from pydantic import BaseModel, Field
from typing import Optional


class VoteIntentionRequest(BaseModel):
    candidate_responses: dict[str, list[float]] = Field(
        description="Mapping of candidate_id to list of daily vote counts"
    )
    territory_id: Optional[str] = None
    territory_level: Optional[str] = None
    campaign_id: Optional[str] = None


class TrendForecastRequest(BaseModel):
    time_series: list[float] = Field(
        description="Time series of values to forecast (ordered chronologically)"
    )
    periods_ahead: int = Field(default=7, ge=1, le=90, description="Number of periods to forecast")
    campaign_id: Optional[str] = None
    territory_id: Optional[str] = None


class TurnoutRequest(BaseModel):
    historical_turnout: list[float] = Field(
        default=[],
        description="Historical turnout rates as decimals (0.0–1.0)"
    )
    registered_voters: int = Field(ge=1, description="Number of registered voters")
    campaign_intensity: float = Field(
        default=0.5, ge=0.0, le=1.0, description="Campaign intensity factor"
    )
    territory_id: Optional[str] = None


class SentimentRequest(BaseModel):
    texts: list[str] = Field(description="List of open-text responses to analyze")
    campaign_id: Optional[str] = None


class GeoPoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    id: Optional[str] = None
    quality_score: Optional[float] = None
    candidate_id: Optional[str] = None


class ClusteringRequest(BaseModel):
    points: list[GeoPoint] = Field(description="Geographic points to cluster")
    eps_km: float = Field(default=5.0, gt=0, description="Maximum cluster radius in km")
    min_samples: int = Field(default=3, ge=2, description="Minimum points per cluster")
    value_field: Optional[str] = Field(default=None, description="Field to aggregate in clusters")

    def model_post_init(self, __context: object) -> None:
        # Convert GeoPoint objects to dicts for the clustering function
        object.__setattr__(
            self,
            "points",
            [p.model_dump() for p in self.points],
        )


class AnomalyRequest(BaseModel):
    responses: list[dict] = Field(description="Survey responses with quality_score fields")
    threshold_std: float = Field(
        default=2.5, gt=0, description="Number of standard deviations for anomaly threshold"
    )
    campaign_id: Optional[str] = None
