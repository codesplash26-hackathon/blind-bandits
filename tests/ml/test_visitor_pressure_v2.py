from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest

from ml.training.visitor_pressure import load_dataset, load_monthly_arrivals
from ml.training.visitor_pressure_v2 import (
    RESIDUAL_TARGET,
    V2_FEATURES,
    add_leakage_safe_v2_features,
    assert_v2_feature_integrity,
    common_eligible_rows,
    reconstruct_from_residual,
    run_v2_experiments,
)

ROOT = Path(__file__).resolve().parents[2]
PROCESSED = ROOT / "data" / "processed"


@pytest.fixture(scope="module")
def arrivals() -> pd.DataFrame:
    return load_monthly_arrivals(PROCESSED / "monthly_arrivals.csv")


@pytest.fixture(scope="module")
def v2_data(arrivals: pd.DataFrame) -> pd.DataFrame:
    source = load_dataset(PROCESSED / "visitor_pressure.csv")
    return add_leakage_safe_v2_features(source, arrivals)


def test_residual_target_correctness(v2_data: pd.DataFrame) -> None:
    eligible = v2_data.dropna(subset=["occupancy_lag_1"])
    expected = eligible["occupancy_rate"] - eligible["occupancy_lag_1"]
    assert np.allclose(eligible[RESIDUAL_TARGET], expected)


def test_prediction_reconstruction() -> None:
    lag = np.asarray([20.0, 55.0, 80.0])
    residual = np.asarray([3.5, -5.0, 1.0])
    assert reconstruct_from_residual(lag, residual).tolist() == [23.5, 50.0, 81.0]


def test_lagged_arrival_growth_has_no_current_month_leakage(
    arrivals: pd.DataFrame,
) -> None:
    source = load_dataset(PROCESSED / "visitor_pressure.csv")
    original = add_leakage_safe_v2_features(source, arrivals)
    changed = source.copy()
    changed["total_arrivals"] = changed["total_arrivals"] + 999_999
    rebuilt = add_leakage_safe_v2_features(changed, arrivals)
    assert original["arrivals_growth_lagged"].equals(rebuilt["arrivals_growth_lagged"])
    valid = original.dropna(subset=["arrivals_growth_lagged"])
    expected = (valid["arrivals_lag_1"] - valid["arrivals_lag_2"]) / valid[
        "arrivals_lag_2"
    ]
    assert np.allclose(valid["arrivals_growth_lagged"], expected)


def test_calendar_continuity_and_gap_handling(
    v2_data: pd.DataFrame, arrivals: pd.DataFrame
) -> None:
    assert_v2_feature_integrity(v2_data, arrivals)
    january = v2_data.loc[(v2_data["year"] == 2024) & (v2_data["month"] == 1)]
    assert january["occupancy_lag_1"].isna().all()
    assert len(common_eligible_rows(v2_data, (2024,))) == 54


@pytest.fixture(scope="module")
def v2_run(tmp_path_factory: pytest.TempPathFactory) -> dict[str, object]:
    root = tmp_path_factory.mktemp("visitor-pressure-v2")
    return run_v2_experiments(
        PROCESSED / "visitor_pressure.csv",
        PROCESSED / "monthly_arrivals.csv",
        root / "evaluation",
        root / "artifacts",
        created_at=datetime(2026, 9, 26, tzinfo=UTC),
        create_plots=False,
    )


def test_every_model_uses_exact_persistence_rows(v2_run: dict[str, object]) -> None:
    metrics = v2_run["metrics"]
    predictions = v2_run["predictions"]
    assert isinstance(metrics, pd.DataFrame)
    assert isinstance(predictions, pd.DataFrame)
    assert metrics["test_rows"].nunique() == 1
    assert metrics["test_rows"].iloc[0] == 54
    persistence_keys = set(
        map(
            tuple,
            predictions.loc[
                predictions["model_name"] == "persistence_baseline",
                ["date", "canonical_region"],
            ].to_numpy(),
        )
    )
    for _, group in predictions.groupby("model_name"):
        assert set(map(tuple, group[["date", "canonical_region"]].to_numpy())) == (
            persistence_keys
        )


def test_search_uses_pre_2024_validation_only(v2_run: dict[str, object]) -> None:
    search = v2_run["search"]
    assert isinstance(search, pd.DataFrame)
    assert set(search["validation_year"]) == {2019}
    assert search["selected"].sum() == 1


def test_v2_artifact_round_trip_and_finite_predictions(
    v2_run: dict[str, object], v2_data: pd.DataFrame
) -> None:
    summary = v2_run["summary"]
    assert isinstance(summary, dict)
    assert summary["selected_model"] == "residual_lightgbm_r2"
    model_path = Path(summary["artifact_paths"][0])
    metadata_path = Path(summary["artifact_paths"][1])
    payload = joblib.load(model_path)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    assert payload["feature_names"] == list(V2_FEATURES)
    assert metadata["target_type"] == "residual"
    test = common_eligible_rows(v2_data, (2024,))
    predicted_residual = payload["model"].predict(test[list(V2_FEATURES)])
    final = reconstruct_from_residual(test["occupancy_lag_1"], predicted_residual)
    assert final.shape == (54,)
    assert np.isfinite(predicted_residual).all()
    assert np.isfinite(final).all()
