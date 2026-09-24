"""Deterministic cosine similarity over available destination attributes."""

from collections.abc import Sequence
from math import asin, cos, radians, sin, sqrt

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.models.destination import Destination

EARTH_RADIUS_KM = 6371.0


def destination_feature_vectors(
    destinations: Sequence[Destination],
) -> tuple[np.ndarray, tuple[str, ...]]:
    """One-hot landscape and multi-hot activities; no climate values are available."""
    vocabulary = tuple(
        sorted(
            {f"landscape:{item.landscape_type.casefold()}" for item in destinations}
            | {
                f"activity:{activity.slug.casefold()}"
                for item in destinations
                for activity in item.activities
            }
        )
    )
    index = {name: position for position, name in enumerate(vocabulary)}
    vectors = np.zeros((len(destinations), len(vocabulary)), dtype=float)
    for row, destination in enumerate(destinations):
        vectors[row, index[f"landscape:{destination.landscape_type.casefold()}"]] = 1
        for activity in destination.activities:
            vectors[row, index[f"activity:{activity.slug.casefold()}"]] = 1
    return vectors, vocabulary


def destination_cosine_similarities(
    source: Destination,
    candidates: Sequence[Destination],
) -> list[float]:
    if not candidates:
        return []
    vectors, _ = destination_feature_vectors([source, *candidates])
    values = cosine_similarity(vectors[:1], vectors[1:])[0]
    return [min(1.0, max(0.0, float(value))) for value in values]


def straight_line_distance_km(source: Destination, other: Destination) -> float:
    """Geographic distance, not a road distance or travel-time estimate."""
    lat1, lon1 = radians(float(source.latitude)), radians(float(source.longitude))
    lat2, lon2 = radians(float(other.latitude)), radians(float(other.longitude))
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    haversine = (
        sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    )
    return 2 * EARTH_RADIUS_KM * asin(min(1.0, sqrt(haversine)))
