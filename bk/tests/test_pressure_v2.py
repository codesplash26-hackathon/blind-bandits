"""Contract tests for the finalized residual LightGBM v2 artifact."""

from __future__ import annotations

from collections.abc import Iterator
from copy import deepcopy
from pathlib import Path

import numpy as np
import pytest
from httpx2 import AsyncClient

from app.core.config import get_settings
from app.ml.pressure import artifact as artifact_module
from app.ml.pressure.artifact import load_artifact
from app.ml.pressure.explanation import explain_visitor_pressure
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    UnknownPressureRegionError,
    predict_visitor_pressure,
)
from app.models.user import User
from app.schemas.pressure import PressureBandThresholds
from tests.test_destinations import (
    EXAMPLE_DESTINATION,
    admin_headers,
    create_example_destination,
    tourist_headers,
)

ROOT = Path(__file__).resolve().parents[2]
V2_ARTIFACTS = ROOT / "ml" / "artifacts"


@pytest.fixture
def v2_pressure_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(V2_ARTIFACTS))
    monkeypatch.setenv("PRESSURE_BAND_THRESHOLDS", '{"low_max": 40, "medium_max": 70}')
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_v2_artifact_loads_selected_model_and_is_cached(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    artifact_module._load_artifact_cached.cache_clear()
    calls = 0
    original = artifact_module.joblib.load

    def counted_load(path):
        nonlocal calls
        calls += 1
        return original(path)

    monkeypatch.setattr(artifact_module.joblib, "load", counted_load)
    first = load_artifact(V2_ARTIFACTS)
    second = load_artifact(V2_ARTIFACTS)
    assert first is second
    assert calls == 1
    assert first.target_type == "residual"
    assert first.metadata["model_version"] == (
        "v2_20260926T104528Z_residual_lightgbm_r2"
    )
    assert len(first.feature_names) == 15


def test_v2_prediction_and_explanation_service_contracts_match() -> None:
    prediction = predict_visitor_pressure(
        V2_ARTIFACTS,
        region="Southern",
        month="2024-05",
        thresholds=PressureBandThresholds(low_max=40, medium_max=70),
    )
    explanation = explain_visitor_pressure(
        V2_ARTIFACTS,
        destination_id=1,
        destination_slug="example-coastal-trail",
        region="Southern",
        month="2024-05",
        thresholds=PressureBandThresholds(low_max=40, medium_max=70),
    )
    assert prediction.region == "South Coast"
    assert prediction.predicted_residual is not None
    assert prediction.pressure_band is not None
    assert prediction.previous_occupancy is not None
    assert prediction.predicted_occupancy == pytest.approx(
        prediction.previous_occupancy + prediction.predicted_residual
    )
    assert explanation.model_version == prediction.model_version
    assert explanation.predicted_occupancy == pytest.approx(
        prediction.predicted_occupancy
    )
    assert explanation.predicted_residual == pytest.approx(
        prediction.predicted_residual
    )
    assert explanation.base_residual is not None
    assert explanation.base_residual + sum(
        item.shap_value for item in explanation.feature_contributions
    ) == pytest.approx(explanation.predicted_residual, abs=1e-6)
    assert all(
        np.isfinite(item.shap_value) for item in explanation.feature_contributions
    )
    assert len(explanation.feature_contributions) == 15


def test_v2_controlled_errors_for_history_and_region() -> None:
    with pytest.raises(ForecastContextUnavailableError, match="lag history"):
        predict_visitor_pressure(V2_ARTIFACTS, region="Southern", month="2024-01")
    with pytest.raises(UnknownPressureRegionError, match="not mapped"):
        predict_visitor_pressure(V2_ARTIFACTS, region="Unknown", month="2024-05")


@pytest.mark.anyio
async def test_v2_prediction_and_explanation_endpoints(
    client: AsyncClient,
    admin_user: User,
    v2_pressure_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    path = f"/api/v1/destinations/{destination['id']}/pressure"
    assert (await client.get(f"{path}?month=2024-05")).status_code == 401
    headers = await tourist_headers(client)
    prediction_response = await client.get(f"{path}?month=2024-05", headers=headers)
    explanation_response = await client.get(
        f"{path}/explanation?month=2024-05", headers=headers
    )
    assert prediction_response.status_code == 200, prediction_response.text
    assert explanation_response.status_code == 200, explanation_response.text
    prediction = prediction_response.json()
    explanation = explanation_response.json()
    assert prediction["model_version"] == explanation["model_version"]
    assert prediction["predicted_occupancy"] == pytest.approx(
        explanation["predicted_occupancy"]
    )
    assert prediction["predicted_residual"] == pytest.approx(
        explanation["predicted_residual"]
    )
    assert prediction["previous_occupancy"] + prediction["predicted_residual"] == (
        pytest.approx(prediction["predicted_occupancy"])
    )
    assert prediction["pressure_band"] in ("LOW", "MEDIUM", "HIGH")
    assert explanation["base_residual"] is not None
    assert explanation["explanation_text"] == explanation["plain_language_explanation"]
    assert explanation["prediction_type"] == "regional_monthly_occupancy"
    assert explanation["forecast_mode"] == "one_month_ahead_walk_forward"


@pytest.mark.anyio
async def test_v2_endpoint_insufficient_history_and_unmapped_region(
    client: AsyncClient,
    admin_user: User,
    v2_pressure_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    headers = await admin_headers(client, admin_user)
    base = f"/api/v1/destinations/{destination['id']}/pressure"
    unavailable = await client.get(f"{base}?month=2024-01", headers=headers)
    assert unavailable.status_code == 404
    assert "Insufficient exact lag history" in unavailable.json()["detail"]

    payload = deepcopy(EXAMPLE_DESTINATION)
    payload.update({"slug": "unmapped", "name": "Unmapped", "region": "Unmapped"})
    unknown = await create_example_destination(client, admin_user, payload)
    response = await client.get(
        f"/api/v1/destinations/{unknown['id']}/pressure?month=2024-05",
        headers=headers,
    )
    assert response.status_code == 422
    assert "not mapped" in response.json()["detail"]
