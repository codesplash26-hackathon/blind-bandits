"""Mockable HTTP adapters for Open-Meteo and OpenAQ v3."""

from dataclasses import dataclass
from datetime import UTC, datetime
from math import asin, cos, isfinite, radians, sin, sqrt
from typing import Any, Protocol

import httpx

from app.models.destination import Destination
from app.models.environment import ObservationType


class ProviderError(Exception):
    code = "provider_unavailable"


class MalformedProviderResponse(ProviderError):
    code = "malformed_provider_response"


class NoProviderData(ProviderError):
    code = "no_provider_data"


@dataclass(frozen=True)
class ProviderObservation:
    observation_type: ObservationType
    values: dict[str, str | int | float]
    source: str
    source_location: str
    observed_at: datetime


class EnvironmentalProvider(Protocol):
    async def fetch(self, destination: Destination) -> ProviderObservation: ...


async def _get_json(
    client: httpx.AsyncClient, url: str, **kwargs: Any
) -> dict[str, Any]:
    try:
        response = await client.get(url, **kwargs)
        response.raise_for_status()
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise ProviderError from exc
    if not isinstance(payload, dict):
        raise MalformedProviderResponse
    return payload


def _mapping(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise MalformedProviderResponse
    return value


def _list(value: Any) -> list[Any]:
    if not isinstance(value, list):
        raise MalformedProviderResponse
    return value


def _number(value: Any) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise MalformedProviderResponse
    result = float(value)
    if not isfinite(result):
        raise MalformedProviderResponse
    return result


def _utc_time(value: Any, *, allow_naive: bool = False) -> datetime:
    if not isinstance(value, str) or "T" not in value:
        raise MalformedProviderResponse
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError as exc:
        raise MalformedProviderResponse from exc
    if parsed.tzinfo is None:
        if not allow_naive:
            raise MalformedProviderResponse
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


class OpenMeteoProvider:
    def __init__(
        self, client: httpx.AsyncClient, url: str, api_key: str | None = None
    ) -> None:
        self.client = client
        self.url = url
        self.api_key = api_key

    async def fetch(self, destination: Destination) -> ProviderObservation:
        latitude = float(destination.latitude)
        longitude = float(destination.longitude)
        params: dict[str, str | float] = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code",
            "temperature_unit": "celsius",
            "precipitation_unit": "mm",
            "timezone": "GMT",
        }
        if self.api_key:
            params["apikey"] = self.api_key
        payload = await _get_json(
            self.client,
            self.url,
            params=params,
        )
        current = _mapping(payload.get("current"))
        temperature = _number(current.get("temperature_2m"))
        humidity = _number(current.get("relative_humidity_2m"))
        precipitation = _number(current.get("precipitation"))
        code = current.get("weather_code")
        if (
            not 0 <= humidity <= 100
            or precipitation < 0
            or type(code) is not int
            or not 0 <= code <= 99
        ):
            raise MalformedProviderResponse
        units = payload.get("current_units")
        if units is not None:
            units = _mapping(units)
            if (
                units.get("temperature_2m") != "°C"
                or units.get("relative_humidity_2m") != "%"
                or units.get("precipitation") != "mm"
            ):
                raise MalformedProviderResponse
        return ProviderObservation(
            observation_type=ObservationType.WEATHER,
            values={
                "temperature_c": temperature,
                "relative_humidity_percent": humidity,
                "precipitation_mm": precipitation,
                "weather_code": code,
            },
            source="Open-Meteo",
            source_location=f"{latitude:.6f},{longitude:.6f}",
            observed_at=_utc_time(current.get("time"), allow_naive=True),
        )


def _distance_m(a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    lat_delta = radians(b_lat - a_lat)
    lon_delta = radians(b_lon - a_lon)
    arc = 2 * asin(
        sqrt(
            sin(lat_delta / 2) ** 2
            + cos(radians(a_lat)) * cos(radians(b_lat)) * sin(lon_delta / 2) ** 2
        )
    )
    return 6_371_000 * arc


class OpenAQProvider:
    def __init__(
        self,
        client: httpx.AsyncClient,
        url: str,
        api_key: str | None,
        radius_m: int,
    ) -> None:
        self.client = client
        self.url = url.rstrip("/")
        self.api_key = api_key
        self.radius_m = radius_m

    async def fetch(self, destination: Destination) -> ProviderObservation:
        if not self.api_key:
            raise ProviderError("OpenAQ API key is not configured")
        headers = {"X-API-Key": self.api_key}
        latitude = float(destination.latitude)
        longitude = float(destination.longitude)
        locations = await _get_json(
            self.client,
            f"{self.url}/locations",
            headers=headers,
            params={
                "coordinates": f"{latitude:.4f},{longitude:.4f}",
                "radius": self.radius_m,
                "parameters_id": 2,  # OpenAQ PM2.5 parameter ID.
                "limit": 25,
            },
        )
        candidates: list[tuple[float, int, str, int, str]] = []
        for raw in _list(locations.get("results")):
            location = _mapping(raw)
            if location.get("isMobile") is True:
                continue
            coordinates = _mapping(location.get("coordinates"))
            if (
                coordinates.get("latitude") is None
                or coordinates.get("longitude") is None
            ):
                continue
            distance = _distance_m(
                latitude,
                longitude,
                _number(coordinates["latitude"]),
                _number(coordinates["longitude"]),
            )
            if distance > self.radius_m:
                continue
            location_id = location.get("id")
            name = location.get("name")
            if type(location_id) is not int or not isinstance(name, str):
                raise MalformedProviderResponse
            for raw_sensor in _list(location.get("sensors")):
                sensor = _mapping(raw_sensor)
                parameter = _mapping(sensor.get("parameter"))
                if parameter.get("name") == "pm25":
                    sensor_id = sensor.get("id")
                    unit = parameter.get("units")
                    if type(sensor_id) is not int or not isinstance(unit, str):
                        raise MalformedProviderResponse
                    candidates.append((distance, location_id, name, sensor_id, unit))
                    break

        # A nearby station is a proxy for the destination, never a measurement at it.
        for distance, location_id, name, sensor_id, unit in sorted(candidates):
            latest = await _get_json(
                self.client,
                f"{self.url}/locations/{location_id}/latest",
                headers=headers,
            )
            for raw in _list(latest.get("results")):
                measurement = _mapping(raw)
                if measurement.get("sensorsId") != sensor_id:
                    continue
                if measurement.get("locationsId") != location_id:
                    raise MalformedProviderResponse
                observed_at = _utc_time(
                    _mapping(measurement.get("datetime")).get("utc")
                )
                value = _number(measurement.get("value"))
                if value < 0:
                    raise MalformedProviderResponse
                return ProviderObservation(
                    observation_type=ObservationType.AIR_QUALITY,
                    values={
                        "pm25": value,
                        "unit": unit,
                        "station_name": name,
                        "station_distance_m": round(distance),
                    },
                    source="OpenAQ",
                    source_location=str(location_id),
                    observed_at=observed_at,
                )
        raise NoProviderData("No nearby PM2.5 measurements")
