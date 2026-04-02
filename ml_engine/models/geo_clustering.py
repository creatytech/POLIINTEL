"""
Geospatial clustering using DBSCAN to identify electoral support patterns.
"""

import numpy as np
from typing import Optional


def _haversine_matrix(coords: np.ndarray) -> np.ndarray:
    """Compute pairwise haversine distances between lat/lng coordinates in km."""
    lat = np.radians(coords[:, 0])
    lng = np.radians(coords[:, 1])

    n = len(coords)
    dist_matrix = np.zeros((n, n))

    for i in range(n):
        dlat = lat - lat[i]
        dlng = lng - lng[i]
        a = np.sin(dlat / 2) ** 2 + np.cos(lat[i]) * np.cos(lat) * np.sin(dlng / 2) ** 2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        dist_matrix[i] = 6371 * c

    return dist_matrix


def dbscan_clustering(
    points: list[dict],
    eps_km: float = 5.0,
    min_samples: int = 3,
    value_field: Optional[str] = None,
) -> dict:
    """
    Cluster geographic points using a simplified DBSCAN algorithm.

    Args:
        points: List of dicts with 'lat', 'lng', and optional value fields
        eps_km: Maximum distance in km between points in same cluster
        min_samples: Minimum points to form a cluster
        value_field: Optional field to aggregate within clusters

    Returns:
        Dict with clusters, noise points, and cluster statistics
    """
    if len(points) < min_samples:
        return {
            "clusters": [],
            "noise_count": len(points),
            "n_clusters": 0,
            "algorithm": "dbscan",
        }

    coords = np.array([[p["lat"], p["lng"]] for p in points])
    dist_matrix = _haversine_matrix(coords)
    n = len(points)

    labels = np.full(n, -1, dtype=int)
    cluster_id = 0

    def get_neighbors(idx: int) -> list[int]:
        return [j for j in range(n) if dist_matrix[idx, j] <= eps_km]

    def expand_cluster(idx: int, neighbors: list[int], cluster: int) -> None:
        labels[idx] = cluster
        i = 0
        while i < len(neighbors):
            neighbor = neighbors[i]
            if labels[neighbor] == -1:
                labels[neighbor] = cluster
                new_neighbors = get_neighbors(neighbor)
                if len(new_neighbors) >= min_samples:
                    neighbors.extend(new_neighbors)
            i += 1

    for idx in range(n):
        if labels[idx] != -1:
            continue
        neighbors = get_neighbors(idx)
        if len(neighbors) < min_samples:
            continue
        labels[idx] = cluster_id
        expand_cluster(idx, neighbors, cluster_id)
        cluster_id += 1

    # Build cluster statistics
    clusters = []
    for cid in range(cluster_id):
        mask = labels == cid
        cluster_points = [points[i] for i in range(n) if mask[i]]
        cluster_coords = coords[mask]

        centroid_lat = float(np.mean(cluster_coords[:, 0]))
        centroid_lng = float(np.mean(cluster_coords[:, 1]))

        cluster_info: dict = {
            "id": cid,
            "size": int(mask.sum()),
            "centroid": {"lat": round(centroid_lat, 6), "lng": round(centroid_lng, 6)},
        }

        if value_field:
            values = [p.get(value_field, 0) for p in cluster_points if value_field in p]
            if values:
                cluster_info["avg_value"] = round(float(np.mean(values)), 4)
                cluster_info["max_value"] = round(float(np.max(values)), 4)

        clusters.append(cluster_info)

    return {
        "clusters": clusters,
        "noise_count": int((labels == -1).sum()),
        "n_clusters": cluster_id,
        "algorithm": "dbscan",
        "params": {"eps_km": eps_km, "min_samples": min_samples},
    }


def detect_anomalies(
    responses: list[dict],
    threshold_std: float = 2.5,
) -> dict:
    """
    Detect anomalous survey responses based on quality scores and geographic patterns.

    Returns:
        Dict with anomaly_ids, statistics, and flags
    """
    if not responses:
        return {"anomaly_ids": [], "total": 0, "anomaly_rate": 0.0}

    quality_scores = [r.get("quality_score", 0.5) for r in responses]
    scores_array = np.array(quality_scores, dtype=float)

    mean_score = float(np.mean(scores_array))
    std_score = float(np.std(scores_array))
    threshold = mean_score - threshold_std * std_score

    anomaly_ids = []
    for i, response in enumerate(responses):
        score = quality_scores[i]
        if score < threshold:
            anomaly_ids.append(response.get("id", str(i)))

    return {
        "anomaly_ids": anomaly_ids,
        "total": len(responses),
        "anomaly_count": len(anomaly_ids),
        "anomaly_rate": round(len(anomaly_ids) / len(responses), 4),
        "mean_quality": round(mean_score, 4),
        "std_quality": round(std_score, 4),
        "threshold": round(max(0, threshold), 4),
    }
