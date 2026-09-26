from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest

from ml.training.visitor_pressure import (
    EXPERIMENTS,
    FORBIDDEN_MODEL_FEATURES,
    LAGGED_FEATURES,
    NO_LAG_FEATURES,
    assert_feature_schema,
    assert_no_temporal_leakage,
    assert_temporal_separation,
    build_model,
    eligible_rows,
    load_dataset,
    load_monthly_arrivals,
    persistence_baseline,
    regression_metrics,
    run_training,
    seasonal_baseline,
)

ROOT = Path(__file__).resolve().parents[2]
PROCESSED = ROOT / "data" / "processed"


@pytest.fixture(scope="module")
def data() -> pd.DataFrame:
    return load_dataset(PROCESSED / "visitor_pressure.csv")


@pytest.fixture(scope="module")
def arrivals() -> pd.DataFrame:
    return load_monthly_arrivals(PROCESSED / "monthly_arrivals.csv")


def test_train_test_temporal_separation(data: pd.DataFrame) -> None:
    train = eligible_rows(data, EXPERIMENTS[0].train_years, NO_LAG_FEATURES)
    test = eligible_rows(data, (2024,), NO_LAG_FEATURES)
    assert_temporal_separation(train, test, EXPERIMENTS[0].train_years, 2024)
    assert train["date"].max() < test["date"].min()


def test_no_target_or_same_month_arrival_leakage() -> None:
    assert not (set(NO_LAG_FEATURES) & FORBIDDEN_MODEL_FEATURES)
    assert not (set(LAGGED_FEATURES) & FORBIDDEN_MODEL_FEATURES)
    assert_feature_schema(NO_LAG_FEATURES)
    with pytest.raises(ValueError, match="Forbidden"):
        assert_feature_schema((*NO_LAG_FEATURES, "total_arrivals"))


def test_all_history_features_are_calendar_aligned(
    data: pd.DataFrame, arrivals: pd.DataFrame
) -> None:
    assert_no_temporal_leakage(data, arrivals)


def test_seasonal_baseline_uses_training_only() -> None:
    train = pd.DataFrame(
        {
            "canonical_region": ["South Coast", "South Coast"],
            "month": [1, 1],
            "occupancy_rate": [20.0, 40.0],
        }
    )
    test = pd.DataFrame(
        {"canonical_region": ["South Coast"], "month": [1], "occupancy_rate": [99.0]}
    )
    assert seasonal_baseline(train, test).tolist() == [30.0]


def test_persistence_baseline_behavior() -> None:
    frame = pd.DataFrame({"occupancy_lag_1": [17.5, np.nan, 51.0]})
    result = persistence_baseline(frame)
    assert result[0] == 17.5
    assert np.isnan(result[1])
    assert result[2] == 51.0


def test_model_feature_schema_and_categorical_consistency(data: pd.DataFrame) -> None:
    train = eligible_rows(data, (2017, 2018, 2019), NO_LAG_FEATURES)
    model = build_model(NO_LAG_FEATURES).fit(
        train[list(NO_LAG_FEATURES)], train["occupancy_rate"]
    )
    encoder = model.named_steps["preprocessing"].named_transformers_["region"]
    categories = set(encoder.categories_[0])
    assert categories == set(train["canonical_region"].unique())
    assert list(model.feature_names_in_) == list(NO_LAG_FEATURES)


def test_prediction_shape_and_values_are_finite(data: pd.DataFrame) -> None:
    train = eligible_rows(data, (2017, 2018, 2019), LAGGED_FEATURES)
    test = eligible_rows(data, (2024,), LAGGED_FEATURES)
    prediction = (
        build_model(LAGGED_FEATURES)
        .fit(train[list(LAGGED_FEATURES)], train["occupancy_rate"])
        .predict(test[list(LAGGED_FEATURES)])
    )
    assert prediction.shape == (54,)
    assert np.isfinite(prediction).all()


def test_2024_gap_handling_and_coverage(data: pd.DataFrame) -> None:
    january = data.loc[(data["year"] == 2024) & (data["month"] == 1)]
    assert len(january) == 6
    assert (
        january[["occupancy_lag_1", "occupancy_lag_2", "occupancy_lag_3"]]
        .isna()
        .all()
        .all()
    )
    assert len(eligible_rows(data, (2024,), NO_LAG_FEATURES)) == 72
    assert len(eligible_rows(data, (2024,), LAGGED_FEATURES)) == 54
    assert not data["year"].isin([2021, 2022, 2023]).any()


def test_same_row_baseline_model_comparison(data: pd.DataFrame) -> None:
    train = eligible_rows(data, (2017, 2018, 2019), LAGGED_FEATURES)
    test = eligible_rows(data, (2024,), LAGGED_FEATURES)
    predicted = (
        build_model(LAGGED_FEATURES)
        .fit(train[list(LAGGED_FEATURES)], train["occupancy_rate"])
        .predict(test[list(LAGGED_FEATURES)])
    )
    baseline = seasonal_baseline(train, test)
    assert len(predicted) == len(baseline) == len(test) == 54
    assert regression_metrics(test["occupancy_rate"], predicted)["mae"] >= 0


def test_artifact_save_load_round_trip(tmp_path: Path) -> None:
    result = run_training(
        PROCESSED / "visitor_pressure.csv",
        PROCESSED / "monthly_arrivals.csv",
        tmp_path / "evaluation",
        tmp_path / "artifacts",
        created_at=datetime(2026, 9, 26, tzinfo=UTC),
        create_plots=False,
    )
    metadata_path = tmp_path / "artifacts" / "model_metadata.json"
    model_path = tmp_path / "artifacts" / "visitor_pressure_model.joblib"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    model = joblib.load(model_path)
    features = metadata["feature_names"]
    test = eligible_rows(
        load_dataset(PROCESSED / "visitor_pressure.csv"), (2024,), features
    )
    prediction = model.predict(test[features])
    assert metadata["model_version"] == result["metadata"]["model_version"]
    assert prediction.shape == (metadata["test_rows"],)
    assert np.isfinite(prediction).all()
    comparison = pd.read_csv(tmp_path / "evaluation" / "model_comparison.csv")
    assert set(
        comparison.loc[comparison["evaluation_role"] == "final_test", "test_year"]
    ) == {2024}
