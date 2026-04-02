"""
Electoral trend prediction using regression and ARIMA models.
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Optional


def _simple_linear_trend(values: list[float]) -> dict:
    """Fit a simple linear regression to a time series."""
    if len(values) < 2:
        return {"slope": 0.0, "trend": "stable", "r_squared": 0.0}

    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)

    # Least squares fit
    n = len(x)
    slope = (n * np.dot(x, y) - x.sum() * y.sum()) / (n * np.dot(x, x) - x.sum() ** 2)
    intercept = (y.sum() - slope * x.sum()) / n

    y_pred = slope * x + intercept
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - y.mean()) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    trend = "stable"
    if slope > 0.5:
        trend = "up"
    elif slope < -0.5:
        trend = "down"

    return {
        "slope": round(float(slope), 4),
        "intercept": round(float(intercept), 4),
        "trend": trend,
        "r_squared": round(float(r_squared), 4),
    }


def predict_vote_intention(
    candidate_responses: dict[str, list[float]],
    territory_id: Optional[str] = None,
) -> dict:
    """
    Predict vote intention for each candidate.

    Args:
        candidate_responses: {candidate_id: [daily_vote_counts]}
        territory_id: Optional territory to scope prediction

    Returns:
        Prediction dict with winner, probabilities, trends
    """
    if not candidate_responses:
        return {
            "winner": None,
            "probabilities": {},
            "trends": {},
            "confidence": 0.0,
            "sample_size": 0,
        }

    totals: dict[str, float] = {}
    trends: dict[str, str] = {}

    for candidate, values in candidate_responses.items():
        totals[candidate] = float(sum(values))
        trend_info = _simple_linear_trend(values)
        trends[candidate] = trend_info["trend"]

    total_responses = sum(totals.values())
    if total_responses == 0:
        return {
            "winner": None,
            "probabilities": {c: 0.0 for c in candidate_responses},
            "trends": trends,
            "confidence": 0.0,
            "sample_size": 0,
        }

    probabilities = {c: round(v / total_responses, 4) for c, v in totals.items()}
    winner = max(probabilities, key=lambda k: probabilities[k])

    # Confidence based on margin between top 2
    sorted_probs = sorted(probabilities.values(), reverse=True)
    margin = sorted_probs[0] - (sorted_probs[1] if len(sorted_probs) > 1 else 0)
    confidence = min(0.95, max(0.5, margin * 3))

    return {
        "winner": winner,
        "probabilities": probabilities,
        "trends": trends,
        "confidence": round(confidence, 4),
        "margin": round(margin, 4),
        "sample_size": int(total_responses),
        "territory_id": territory_id,
    }


def predict_turnout(
    historical_turnout: list[float],
    registered_voters: int,
    campaign_intensity: float = 0.5,
) -> dict:
    """Estimate voter turnout based on historical data and campaign factors."""
    if not historical_turnout:
        base_rate = 0.60
    else:
        base_rate = float(np.mean(historical_turnout))

    adjusted_rate = min(0.95, base_rate + (campaign_intensity - 0.5) * 0.1)
    estimated_voters = int(registered_voters * adjusted_rate)

    trend_info = _simple_linear_trend(historical_turnout) if len(historical_turnout) > 1 else {}

    return {
        "estimated_turnout_rate": round(adjusted_rate, 4),
        "estimated_voters": estimated_voters,
        "registered_voters": registered_voters,
        "historical_avg": round(base_rate, 4),
        "trend": trend_info.get("trend", "stable"),
        "confidence": 0.75,
    }


def forecast_trend(
    time_series: list[float],
    periods_ahead: int = 7,
) -> dict:
    """Forecast future values using simple linear extrapolation."""
    if len(time_series) < 3:
        return {
            "forecast": [],
            "confidence_intervals": [],
            "model": "insufficient_data",
        }

    trend_info = _simple_linear_trend(time_series)
    n = len(time_series)

    forecast = []
    confidence_intervals = []

    std = float(np.std(time_series)) if len(time_series) > 1 else 1.0

    for i in range(1, periods_ahead + 1):
        x_new = n + i - 1
        predicted = trend_info["intercept"] + trend_info["slope"] * x_new
        predicted = max(0, predicted)
        margin = 1.96 * std * (1 + 1 / n) ** 0.5

        forecast.append(round(predicted, 2))
        confidence_intervals.append({
            "lower": round(max(0, predicted - margin), 2),
            "upper": round(predicted + margin, 2),
        })

    future_dates = [
        (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(1, periods_ahead + 1)
    ]

    return {
        "forecast": list(zip(future_dates, forecast)),
        "confidence_intervals": list(zip(future_dates, confidence_intervals)),
        "trend": trend_info["trend"],
        "r_squared": trend_info["r_squared"],
        "model": "linear_regression",
    }
