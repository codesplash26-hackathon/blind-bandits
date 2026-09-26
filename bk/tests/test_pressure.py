"""Synthetic examples here are test fixtures, not tourism research data."""

from collections.abc import Iterator
from pathlib import Path

import pandas as pd
import pytest
from httpx2 import AsyncClient

from app.core.config import get_settings
from app.ml.pressure.artifact import MissingPressureModelError, load_artifact
from app.ml.pressure.data import prepare_observations
from app.ml.pressure.evaluation import (
    calculate_mae,
    chronological_split,
    seasonal_average_baseline,
)
from app.ml.pressure.explanation import (
    explain_regional_pressure,
    load_explainer,
    plain_language_explanation,
)
from app.ml.pressure.features import FEATURE_NAMES, engineer_features
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    predict_regional_pressure,
    pressure_band,
)
from app.ml.pressure.training import train_pressure_model
from app.models.user import User
from app.schemas.pressure import (
    PressureBand,
    PressureBandThresholds,
    PressureFeatureContribution,
)
from tests.test_destinations import (
    admin_headers,
    create_example_destination,
    tourist_headers,
)


@pytest.fixture
def sample_observations() -> pd.DataFrame:
    records = []
    for region, offset in (("South Coast", 0), ("Hill Country", 12)):
        for index, month in enumerate(
            pd.date_range("2023-01-01", periods=36, freq="MS")
        ):
            records.append(
                {
                    "month": month.strftime("%Y-%m"),
                    "region": region,
                    "occupancy_rate": float(30 + offset + month.month + index / 3),
                    "tourist_arrivals": 1000 + offset * 20 + index * 10,
                    "is_holiday": int(month.month in (4, 12)),
                    "is_peak_season": int(month.month in (1, 12)),
                }
            )
    return pd.DataFrame(records)


@pytest.fixture
def sample_calendar() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"month": "2026-01", "region": region, "is_holiday": 0, "is_peak_season": 1}
            for region in ("South Coast", "Hill Country")
        ]
    )


@pytest.fixture
def trained_artifact(
    tmp_path: Path,
    sample_observations: pd.DataFrame,
    sample_calendar: pd.DataFrame,
) -> Path:
    directory = tmp_path / "pressure"
    train_pressure_model(
        sample_observations,
        sample_calendar,
        version="synthetic-test-v1",
        output_dir=directory,
    )
    return directory


@pytest.fixture
def pressure_settings(
    monkeypatch: pytest.MonkeyPatch, trained_artifact: Path
) -> Iterator[None]:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(trained_artifact))
    monkeypatch.setenv("PRESSURE_BAND_THRESHOLDS", '{"low_max": 40, "medium_max": 70}')
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_feature_preparation_uses_previous_months_only(
    sample_observations: pd.DataFrame,
) -> None:
    features = engineer_features(sample_observations)
    row = features.loc[
        (features["region"] == "South Coast")
        & (features["month"] == pd.Timestamp("2023-04-01"))
    ].iloc[0]
    assert row["occupancy_lag_1"] == pytest.approx(33 + 2 / 3)
    assert row["occupancy_lag_3"] == pytest.approx(31)
    assert row["arrivals_lag_1"] == 1020
    assert row["arrival_trend"] == pytest.approx(10 / 1010)
    assert set(FEATURE_NAMES).issubset(features.columns)
    assert features["month"].min() == pd.Timestamp("2023-04-01")


def test_feature_preparation_rejects_gaps_and_bad_input(
    sample_observations: pd.DataFrame,
) -> None:
    missing = sample_observations.loc[
        ~(
            (sample_observations["region"] == "South Coast")
            & (sample_observations["month"] == "2023-02")
        )
    ]
    features = engineer_features(missing)
    assert not (
        (features["region"] == "South Coast")
        & (features["month"] == pd.Timestamp("2023-04-01"))
    ).any()
    bad = sample_observations.copy()
    bad.loc[0, "occupancy_rate"] = 101
    with pytest.raises(ValueError, match="occupancy_rate"):
        prepare_observations(bad)


def test_chronological_split_uses_latest_complete_year(
    sample_observations: pd.DataFrame,
) -> None:
    split = chronological_split(engineer_features(sample_observations))
    assert split.strategy == "latest_complete_year"
    assert split.test_year == 2025
    assert split.train["month"].max() < split.test["month"].min()
    assert set(split.test["month"].dt.year) == {2025}
    assert len(split.test) == 24


def test_chronological_split_falls_back_to_recent_months(
    sample_observations: pd.DataFrame,
) -> None:
    short = sample_observations.loc[sample_observations["month"] < "2024-01"]
    split = chronological_split(engineer_features(short))
    assert split.strategy == "latest_months_20_percent"
    assert split.train["month"].max() < split.test["month"].min()


def test_mae_and_seasonal_average_baseline() -> None:
    train = pd.DataFrame(
        {
            "region": ["South Coast", "South Coast", "South Coast"],
            "month": pd.to_datetime(["2022-01-01", "2023-01-01", "2023-02-01"]),
            "occupancy_rate": [20.0, 40.0, 60.0],
        }
    )
    test = pd.DataFrame(
        {
            "region": ["South Coast", "South Coast"],
            "month": pd.to_datetime(["2024-01-01", "2024-03-01"]),
            "occupancy_rate": [50.0, 50.0],
        }
    )
    baseline = seasonal_average_baseline(train, test)
    assert baseline == pytest.approx([30.0, 40.0])
    assert calculate_mae(test["occupancy_rate"], baseline) == pytest.approx(15.0)


def test_training_smoke_and_artifact_loading(trained_artifact: Path) -> None:
    artifact = load_artifact(trained_artifact)
    metadata = artifact.metadata
    assert metadata["model_version"] == "synthetic-test-v1"
    assert metadata["feature_names"] == list(FEATURE_NAMES)
    assert metadata["split_strategy"] == "latest_complete_year"
    assert metadata["evaluation_train_end_month"] == "2024-12"
    assert metadata["deployment_train_end_month"] == "2025-12"
    assert metadata["metrics"]["model_mae"] >= 0
    assert metadata["metrics"]["seasonal_baseline_mae"] >= 0
    assert metadata["metrics"]["model_beats_seasonal_baseline"] == (
        metadata["metrics"]["model_mae"] < metadata["metrics"]["seasonal_baseline_mae"]
    )
    assert (trained_artifact / "model.joblib").is_file()
    assert (trained_artifact / "metadata.json").is_file()


def test_training_rejects_missing_future_calendar_context(
    tmp_path: Path,
    sample_observations: pd.DataFrame,
) -> None:
    unrelated_calendar = pd.DataFrame(
        [
            {
                "month": "2026-02",
                "region": "South Coast",
                "is_holiday": 0,
                "is_peak_season": 0,
            }
        ]
    )
    with pytest.raises(ValueError, match="No next-month"):
        train_pressure_model(
            sample_observations,
            unrelated_calendar,
            version="synthetic-test-v1",
            output_dir=tmp_path / "pressure",
        )


def test_inference_uses_saved_context(trained_artifact: Path) -> None:
    score, version = predict_regional_pressure(
        trained_artifact, region="South Coast", month="2026-01"
    )
    assert 0 <= score <= 100
    assert version == "synthetic-test-v1"
    assert predict_regional_pressure(
        trained_artifact, region="South Coast", month="2026-01"
    ) == (score, version)
    with pytest.raises(ForecastContextUnavailableError):
        predict_regional_pressure(trained_artifact, region="South Coast", month="2026-02")


def test_pressure_band_boundaries() -> None:
    thresholds = PressureBandThresholds(low_max=40, medium_max=70)
    assert pressure_band(40, thresholds) == PressureBand.LOW
    assert pressure_band(41, thresholds) == PressureBand.MEDIUM
    assert pressure_band(70, thresholds) == PressureBand.MEDIUM
    assert pressure_band(71, thresholds) == PressureBand.HIGH
    with pytest.raises(ValueError):
        PressureBandThresholds(low_max=70, medium_max=40)


def test_missing_artifact_raises(tmp_path: Path) -> None:
    with pytest.raises(MissingPressureModelError):
        load_artifact(tmp_path / "missing")


@pytest.mark.anyio
async def test_pressure_endpoint_response_and_authentication(
    client: AsyncClient,
    admin_user: User,
    pressure_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    url = f"/api/v1/destinations/{destination['id']}/pressure?month=2026-01"
    assert (await client.get(url)).status_code == 401
    response = await client.get(url, headers=await admin_headers(client, admin_user))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["destination_id"] == destination["id"]
    assert body["scope"] == "REGIONAL"
    assert body["region"] == "South Coast"
    assert body["month"] == "2026-01"
    assert 0 <= body["predicted_regional_occupancy_rate"] <= 100
    assert body["band"] in ("LOW", "MEDIUM", "HIGH")
    assert body["model_version"] == "synthetic-test-v1"
    tourist_response = await client.get(url, headers=await tourist_headers(client))
    assert tourist_response.status_code == 200


@pytest.mark.anyio
async def test_pressure_endpoint_invalid_and_unavailable_month(
    client: AsyncClient,
    admin_user: User,
    pressure_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    url = f"/api/v1/destinations/{destination['id']}/pressure"
    headers = await admin_headers(client, admin_user)
    assert (
        await client.get(f"{url}?month=2026-13", headers=headers)
    ).status_code == 422
    assert (await client.get(f"{url}?month=bad", headers=headers)).status_code == 422
    assert (
        await client.get(f"{url}?month=2026-02", headers=headers)
    ).status_code == 404


@pytest.mark.anyio
async def test_pressure_endpoint_missing_model(
    client: AsyncClient,
    admin_user: User,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(tmp_path / "absent"))
    monkeypatch.setenv("PRESSURE_BAND_THRESHOLDS", '{"low_max": 40, "medium_max": 70}')
    get_settings.cache_clear()
    try:
        destination = await create_example_destination(client, admin_user)
        response = await client.get(
            f"/api/v1/destinations/{destination['id']}/pressure?month=2026-01",
            headers=await admin_headers(client, admin_user),
        )
        assert response.status_code == 503
    finally:
        get_settings.cache_clear()


def test_tree_shap_explanation_aligns_with_original_features(
    trained_artifact: Path,
) -> None:
    explanation = explain_regional_pressure(
        trained_artifact,
        destination_id=42,
        destination_slug="example-coastal-trail",
        region="South Coast",
        month="2026-01",
        thresholds=PressureBandThresholds(low_max=40, medium_max=70),
    )
    assert explanation.explanation_method == "TreeSHAP"
    assert explanation.contribution_kind == "model_explanation"
    assert explanation.model_version == "synthetic-test-v1"
    assert explanation.destination_id == 42
    assert explanation.region == "South Coast"
    assert explanation.month == "2026-01"
    assert list(explanation.input_features) == list(FEATURE_NAMES)
    assert {item.feature_name for item in explanation.feature_contributions} == set(
        FEATURE_NAMES
    )
    assert len(explanation.feature_contributions) == len(FEATURE_NAMES)
    for item in explanation.feature_contributions:
        assert item.input_value == explanation.input_features[item.feature_name]
    assert explanation.base_value + sum(
        item.shap_value for item in explanation.feature_contributions
    ) == pytest.approx(explanation.raw_model_prediction, abs=1e-5)
    expected_forecast, _ = predict_regional_pressure(
        trained_artifact, region="South Coast", month="2026-01"
    )
    assert explanation.predicted_regional_occupancy_rate == pytest.approx(
        expected_forecast
    )


def test_tree_shap_explainer_is_reused(trained_artifact: Path) -> None:
    first = load_explainer(trained_artifact)
    second = load_explainer(trained_artifact)
    assert first is second
    assert first.tree_explainer is second.tree_explainer


def test_template_explanation_is_deterministic(trained_artifact: Path) -> None:
    kwargs = {
        "destination_id": 42,
        "destination_slug": "example-coastal-trail",
        "region": "South Coast",
        "month": "2026-01",
        "thresholds": PressureBandThresholds(low_max=40, medium_max=70),
    }
    first = explain_regional_pressure(trained_artifact, **kwargs)
    second = explain_regional_pressure(trained_artifact, **kwargs)
    assert first.plain_language_explanation == second.plain_language_explanation
    assert "regional occupancy" in first.plain_language_explanation
    assert "model explanations" in first.plain_language_explanation
    assert "not causal" in first.plain_language_explanation


def test_template_handles_neutral_contributions() -> None:
    text = plain_language_explanation(
        region="South Coast",
        month="2026-01",
        forecast=50,
        base_value=50,
        contributions=[],
    )
    assert "no individual input materially shifts" in text


def test_template_selects_two_strongest_model_drivers() -> None:
    contributions = [
        PressureFeatureContribution(
            feature_name="is_holiday",
            display_name="holiday indicator",
            input_value=1,
            shap_value=0.2,
            direction="INCREASES",
        ),
        PressureFeatureContribution(
            feature_name="occupancy_lag_1",
            display_name="occupancy last month",
            input_value=60,
            shap_value=5.0,
            direction="INCREASES",
        ),
        PressureFeatureContribution(
            feature_name="arrival_trend",
            display_name="recent tourist-arrival trend",
            input_value=-0.1,
            shap_value=-3.0,
            direction="DECREASES",
        ),
    ]
    text = plain_language_explanation(
        region="South Coast",
        month="2026-01",
        forecast=52,
        base_value=50,
        contributions=contributions,
    )
    assert "occupancy last month raises" in text
    assert "recent tourist-arrival trend lowers" in text
    assert "holiday indicator" not in text


def test_explanation_uses_requested_region_context(trained_artifact: Path) -> None:
    thresholds = PressureBandThresholds(low_max=40, medium_max=70)
    southern = explain_regional_pressure(
        trained_artifact,
        destination_id=1,
        destination_slug="southern-example",
        region="South Coast",
        month="2026-01",
        thresholds=thresholds,
    )
    central = explain_regional_pressure(
        trained_artifact,
        destination_id=2,
        destination_slug="central-example",
        region="Hill Country",
        month="2026-01",
        thresholds=thresholds,
    )
    assert southern.input_features["region"] == "South Coast"
    assert central.input_features["region"] == "Hill Country"
    assert (
        southern.input_features["occupancy_lag_1"]
        != central.input_features["occupancy_lag_1"]
    )
    assert southern.destination_id == 1
    assert central.destination_id == 2


@pytest.mark.anyio
async def test_pressure_explanation_endpoint_matches_forecast(
    client: AsyncClient,
    admin_user: User,
    pressure_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    path = f"/api/v1/destinations/{destination['id']}/pressure"
    explanation_url = f"{path}/explanation?month=2026-01"
    assert (await client.get(explanation_url)).status_code == 401
    headers = await tourist_headers(client)
    explanation_response = await client.get(explanation_url, headers=headers)
    forecast_response = await client.get(f"{path}?month=2026-01", headers=headers)
    assert explanation_response.status_code == 200, explanation_response.text
    body = explanation_response.json()
    forecast = forecast_response.json()
    assert body["predicted_regional_occupancy_rate"] == pytest.approx(
        forecast["predicted_regional_occupancy_rate"]
    )
    assert body["band"] == forecast["band"]
    assert body["model_version"] == forecast["model_version"]
    assert body["scope"] == "REGIONAL"
    assert body["input_features"]["region"] == body["region"]
    assert body["month"] == "2026-01"


@pytest.mark.anyio
async def test_pressure_explanation_endpoint_rejects_invalid_requests(
    client: AsyncClient,
    admin_user: User,
    pressure_settings: None,
) -> None:
    destination = await create_example_destination(client, admin_user)
    headers = await admin_headers(client, admin_user)
    base = f"/api/v1/destinations/{destination['id']}/pressure/explanation"
    assert (
        await client.get(f"{base}?month=2026-13", headers=headers)
    ).status_code == 422
    assert (
        await client.get(f"{base}?month=0000-01", headers=headers)
    ).status_code == 422
    assert (
        await client.get(f"{base}?month=2026-02", headers=headers)
    ).status_code == 404
    assert (
        await client.get(
            "/api/v1/destinations/999999/pressure/explanation?month=2026-01",
            headers=headers,
        )
    ).status_code == 404


@pytest.mark.anyio
async def test_pressure_explanation_endpoint_missing_model(
    client: AsyncClient,
    admin_user: User,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setenv("PRESSURE_MODEL_ARTIFACT_DIR", str(tmp_path / "absent"))
    monkeypatch.setenv("PRESSURE_BAND_THRESHOLDS", '{"low_max": 40, "medium_max": 70}')
    get_settings.cache_clear()
    try:
        destination = await create_example_destination(client, admin_user)
        response = await client.get(
            f"/api/v1/destinations/{destination['id']}/pressure/explanation?month=2026-01",
            headers=await admin_headers(client, admin_user),
        )
        assert response.status_code == 503
    finally:
        get_settings.cache_clear()
