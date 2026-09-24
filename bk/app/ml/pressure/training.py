"""Offline LightGBM training and evaluation; never called during API requests."""

from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.ml.pressure.artifact import ARTIFACT_SCHEMA_VERSION, save_artifact
from app.ml.pressure.data import prepare_calendar, prepare_observations
from app.ml.pressure.evaluation import (
    calculate_mae,
    chronological_split,
    seasonal_average_baseline,
)
from app.ml.pressure.features import (
    FEATURE_NAMES,
    build_forecast_inputs,
    engineer_features,
)


def train_pressure_model(
    observations: pd.DataFrame,
    calendar: pd.DataFrame,
    *,
    version: str,
    output_dir: Path,
) -> dict[str, Any]:
    if not version.strip():
        raise ValueError("A nonempty model version is required")
    reviewed = prepare_observations(observations)
    future_calendar = prepare_calendar(calendar)
    forecast_inputs = build_forecast_inputs(reviewed, future_calendar)
    if not forecast_inputs:
        raise ValueError("No next-month regional forecast contexts could be built")
    features = engineer_features(reviewed)
    split = chronological_split(features)
    if split.train.empty or split.test.empty:
        raise ValueError("Chronological split requires nonempty train and test sets")

    preprocessing = ColumnTransformer(
        [("region", OneHotEncoder(handle_unknown="ignore"), ["region"])],
        remainder="passthrough",
    )
    model = Pipeline(
        [
            ("features", preprocessing),
            (
                "regressor",
                LGBMRegressor(
                    n_estimators=50,
                    learning_rate=0.05,
                    num_leaves=7,
                    min_child_samples=1,
                    verbosity=-1,
                    n_jobs=1,
                    random_state=42,
                ),
            ),
        ]
    )
    model.fit(split.train[list(FEATURE_NAMES)], split.train["occupancy_rate"])
    prediction = model.predict(split.test[list(FEATURE_NAMES)])
    model_mae = calculate_mae(split.test["occupancy_rate"], prediction)
    baseline_mae = calculate_mae(
        split.test["occupancy_rate"],
        seasonal_average_baseline(split.train, split.test),
    )
    metrics: dict[str, float | bool] = {
        "model_mae": model_mae,
        "seasonal_baseline_mae": baseline_mae,
        "model_beats_seasonal_baseline": model_mae < baseline_mae,
    }
    # Evaluate on untouched later months, then refit for deployment on all reviewed history.
    model.fit(features[list(FEATURE_NAMES)], features["occupancy_rate"])
    metadata: dict[str, Any] = {
        "schema_version": ARTIFACT_SCHEMA_VERSION,
        "model_version": version,
        "model_type": "LightGBM gradient boosting regressor",
        "target": "regional monthly occupancy rate (0-100)",
        "feature_names": list(FEATURE_NAMES),
        "metrics": metrics,
        "split_strategy": split.strategy,
        "test_year": split.test_year,
        "evaluation_train_end_month": split.train["month"].max().strftime("%Y-%m"),
        "deployment_train_end_month": features["month"].max().strftime("%Y-%m"),
        "test_start_month": split.test["month"].min().strftime("%Y-%m"),
        "test_end_month": split.test["month"].max().strftime("%Y-%m"),
        "trained_at": datetime.now(UTC).isoformat(),
        "forecast_inputs": forecast_inputs,
    }
    save_artifact(output_dir, model, metadata)
    return metadata
