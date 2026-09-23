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
from app.ml.pressure.features import FEATURE_NAMES, engineer_features
from app.ml.pressure.inference import (
    ForecastContextUnavailableError,
    predict_regional_pressure,
    pressure_band,
)
from app.ml.pressure.training import train_pressure_model
from app.models.user import User
from app.schemas.pressure import PressureBand, PressureBandThresholds
from tests.test_destinations import (
    admin_headers,
    create_example_destination,
    tourist_headers,
)


@pytest.fixture
def sample_observations() -> pd.DataFrame:
    records = []
    for region, offset in (("Southern", 0), ("Central", 12)):
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
            for region in ("Southern", "Central")
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
        (features["region"] == "Southern")
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
            (sample_observations["region"] == "Southern")
            & (sample_observations["month"] == "2023-02")
        )
    ]
    features = engineer_features(missing)
    assert not (
        (features["region"] == "Southern")
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
            "region": ["Southern", "Southern", "Southern"],
            "month": pd.to_datetime(["2022-01-01", "2023-01-01", "2023-02-01"]),
            "occupancy_rate": [20.0, 40.0, 60.0],
        }
    )
    test = pd.DataFrame(
        {
            "region": ["Southern", "Southern"],
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
        metadata["metrics"]["model_mae"]
        < metadata["metrics"]["seasonal_baseline_mae"]
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
                "region": "Southern",
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
        trained_artifact, region="Southern", month="2026-01"
    )
    assert 0 <= score <= 100
    assert version == "synthetic-test-v1"
    assert predict_regional_pressure(
        trained_artifact, region="Southern", month="2026-01"
    ) == (score, version)
    with pytest.raises(ForecastContextUnavailableError):
        predict_regional_pressure(trained_artifact, region="Southern", month="2026-02")


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
    assert body["region"] == "Southern"
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
