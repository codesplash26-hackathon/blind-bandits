"""Focused leakage-safe residual and simple-model visitor-pressure experiments."""

from __future__ import annotations

import json
import math
import shutil
from collections.abc import Sequence
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.training.visitor_pressure import (
    CATEGORICAL_FEATURE,
    LAGGED_FEATURES,
    RANDOM_SEED,
    TARGET,
    assert_no_temporal_leakage,
    assert_temporal_separation,
    build_model,
    load_dataset,
    load_monthly_arrivals,
    regression_metrics,
    seasonal_baseline,
)

RESIDUAL_TARGET = "residual_target"
V2_FEATURES = (
    CATEGORICAL_FEATURE,
    "month",
    "month_sin",
    "month_cos",
    "arrivals_lag_1",
    "arrivals_lag_2",
    "arrivals_lag_3",
    "arrivals_growth_lagged",
    "arrivals_change_lag_1",
    "occupancy_lag_1",
    "occupancy_lag_2",
    "occupancy_lag_3",
    "occupancy_rolling_3",
    "occupancy_change_lag_1",
    "occupancy_change_lag_2",
)
CORE_REQUIRED_FEATURES = (
    "arrivals_lag_1",
    "arrivals_lag_2",
    "arrivals_lag_3",
    "occupancy_lag_1",
    "occupancy_lag_2",
    "occupancy_lag_3",
    "occupancy_rolling_3",
)
BASE_LGBM_PARAMS: dict[str, Any] = {
    "objective": "regression_l1",
    "n_estimators": 120,
    "learning_rate": 0.03,
    "num_leaves": 7,
    "max_depth": 3,
    "min_child_samples": 12,
    "reg_lambda": 0.1,
}


def add_leakage_safe_v2_features(
    data: pd.DataFrame, monthly_arrivals: pd.DataFrame
) -> pd.DataFrame:
    """Derive features from exact prior calendar months without changing source CSVs."""
    output = data.copy()
    arrival_lookup = monthly_arrivals.set_index("date")["total_arrivals"].to_dict()
    for lag in (1, 2, 3):
        output[f"arrivals_lag_{lag}"] = [
            arrival_lookup.get(value - pd.DateOffset(months=lag), np.nan)
            for value in output["date"]
        ]
    denominator = output["arrivals_lag_2"].replace(0, np.nan)
    output["arrivals_change_lag_1"] = (
        output["arrivals_lag_1"] - output["arrivals_lag_2"]
    )
    output["arrivals_growth_lagged"] = output["arrivals_change_lag_1"] / denominator
    output["occupancy_change_lag_1"] = (
        output["occupancy_lag_1"] - output["occupancy_lag_2"]
    )
    output["occupancy_change_lag_2"] = (
        output["occupancy_lag_2"] - output["occupancy_lag_3"]
    )
    output["persistence_prediction"] = output["occupancy_lag_1"]
    output[RESIDUAL_TARGET] = output[TARGET] - output["occupancy_lag_1"]
    return output


def assert_v2_feature_integrity(
    data: pd.DataFrame, monthly_arrivals: pd.DataFrame
) -> None:
    arrival_lookup = monthly_arrivals.set_index("date")["total_arrivals"].to_dict()
    tolerance = 1e-9
    for row in data.itertuples(index=False):
        for lag in (1, 2, 3):
            expected = arrival_lookup.get(row.date - pd.DateOffset(months=lag), np.nan)
            actual = getattr(row, f"arrivals_lag_{lag}")
            if pd.isna(expected) != pd.isna(actual) or (
                not pd.isna(expected)
                and not math.isclose(float(actual), float(expected), abs_tol=tolerance)
            ):
                raise ValueError(
                    f"arrivals_lag_{lag} calendar misalignment at {row.date}"
                )
        if not pd.isna(row.arrivals_growth_lagged):
            expected_growth = (
                row.arrivals_lag_1 - row.arrivals_lag_2
            ) / row.arrivals_lag_2
            if not math.isclose(
                row.arrivals_growth_lagged, expected_growth, abs_tol=tolerance
            ):
                raise ValueError("Lagged arrival growth is not prior-only")
        if not pd.isna(row.residual_target):
            expected_residual = row.occupancy_rate - row.occupancy_lag_1
            if not math.isclose(
                row.residual_target, expected_residual, abs_tol=tolerance
            ):
                raise ValueError("Residual target is inconsistent with persistence")
    january_2024 = data.loc[(data["year"] == 2024) & (data["month"] == 1)]
    if january_2024.empty or january_2024["occupancy_lag_1"].notna().any():
        raise ValueError("2024 improperly bridges the occupancy target gap")


def common_eligible_rows(data: pd.DataFrame, years: Sequence[int]) -> pd.DataFrame:
    required = [TARGET, *CORE_REQUIRED_FEATURES]
    return data.loc[data["year"].isin(years)].dropna(subset=required).copy()


def build_residual_lightgbm(params: dict[str, Any] | None = None) -> Pipeline:
    numeric = [feature for feature in V2_FEATURES if feature != CATEGORICAL_FEATURE]
    transformer = ColumnTransformer(
        [
            (
                "region",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                [CATEGORICAL_FEATURE],
            ),
            ("numeric", SimpleImputer(strategy="median"), numeric),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    configuration = dict(BASE_LGBM_PARAMS)
    if params:
        configuration.update(params)
    regressor = LGBMRegressor(
        **configuration,
        random_state=RANDOM_SEED,
        n_jobs=1,
        verbosity=-1,
    )
    return Pipeline([("preprocessing", transformer), ("regressor", regressor)])


def build_ridge(alpha: float = 10.0) -> Pipeline:
    numeric = [feature for feature in V2_FEATURES if feature != CATEGORICAL_FEATURE]
    numeric_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    transformer = ColumnTransformer(
        [
            (
                "region",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                [CATEGORICAL_FEATURE],
            ),
            ("numeric", numeric_pipeline, numeric),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    return Pipeline([("preprocessing", transformer), ("regressor", Ridge(alpha=alpha))])


def reconstruct_from_residual(
    occupancy_lag_1: Sequence[float], predicted_residual: Sequence[float]
) -> np.ndarray:
    lag = np.asarray(occupancy_lag_1, dtype=float)
    residual = np.asarray(predicted_residual, dtype=float)
    if lag.shape != residual.shape:
        raise ValueError("Persistence and residual prediction shapes differ")
    prediction = lag + residual
    if not np.isfinite(prediction).all():
        raise ValueError("Reconstructed predictions must be finite")
    return prediction


def _prediction_frame(
    evaluation: pd.DataFrame,
    prediction: Sequence[float],
    model_name: str,
    train_years: Sequence[int] | None,
) -> pd.DataFrame:
    final_prediction = np.asarray(prediction, dtype=float)
    if (
        final_prediction.shape != (len(evaluation),)
        or not np.isfinite(final_prediction).all()
    ):
        raise ValueError("Prediction output is not finite or row-aligned")
    result = evaluation[
        ["date", CATEGORICAL_FEATURE, TARGET, "occupancy_lag_1", RESIDUAL_TARGET]
    ].copy()
    result = result.rename(
        columns={TARGET: "actual_occupancy", RESIDUAL_TARGET: "actual_residual"}
    )
    result["persistence_prediction"] = result["occupancy_lag_1"]
    result["model_prediction"] = final_prediction
    result["predicted_residual"] = (
        result["model_prediction"] - result["occupancy_lag_1"]
    )
    result["absolute_error"] = np.abs(
        result["actual_occupancy"] - result["model_prediction"]
    )
    result["signed_error"] = result["model_prediction"] - result["actual_occupancy"]
    result["persistence_absolute_error"] = np.abs(result["actual_residual"])
    result["model_name"] = model_name
    result["train_years"] = (
        ";".join(map(str, train_years)) if train_years is not None else ""
    )
    return result


def _metric_row(
    predictions: pd.DataFrame,
    seasonal_prediction: Sequence[float],
    model_name: str,
    target_type: str,
    train_years: Sequence[int] | None,
    notes: str,
) -> dict[str, Any]:
    model_metric = regression_metrics(
        predictions["actual_occupancy"], predictions["model_prediction"]
    )
    persistence_metric = regression_metrics(
        predictions["actual_occupancy"], predictions["persistence_prediction"]
    )
    seasonal_metric = regression_metrics(
        predictions["actual_occupancy"], seasonal_prediction
    )
    return {
        "model_name": model_name,
        "target_type": target_type,
        "train_years": ";".join(map(str, train_years)) if train_years else "",
        "test_year": 2024,
        "test_rows": len(predictions),
        **model_metric,
        "persistence_mae": persistence_metric["mae"],
        "improvement_vs_persistence": persistence_metric["mae"] - model_metric["mae"],
        "seasonal_mae": seasonal_metric["mae"],
        "notes": notes,
    }


def choose_residual_parameters(
    data: pd.DataFrame,
) -> tuple[dict[str, Any], pd.DataFrame]:
    """Use 2019 only for a bounded search; never inspect 2024 here."""
    train = common_eligible_rows(data, (2017, 2018))
    validation = common_eligible_rows(data, (2019,))
    assert_temporal_separation(train, validation, (2017, 2018), 2019)
    persistence_mae = regression_metrics(
        validation[TARGET], validation["occupancy_lag_1"]
    )["mae"]
    base_model = build_residual_lightgbm()
    base_model.fit(train[list(V2_FEATURES)], train[RESIDUAL_TARGET])
    base_residual = base_model.predict(validation[list(V2_FEATURES)])
    base_final = reconstruct_from_residual(validation["occupancy_lag_1"], base_residual)
    base_mae = regression_metrics(validation[TARGET], base_final)["mae"]
    rows = [
        {
            "configuration": "base",
            **BASE_LGBM_PARAMS,
            "validation_year": 2019,
            "validation_rows": len(validation),
            "validation_mae": base_mae,
            "persistence_mae": persistence_mae,
            "selected": False,
        }
    ]
    if base_mae >= persistence_mae:
        rows[0]["selected"] = True
        return dict(BASE_LGBM_PARAMS), pd.DataFrame(rows)

    candidates = (
        {
            "num_leaves": 5,
            "max_depth": 2,
            "min_child_samples": 8,
            "learning_rate": 0.03,
            "n_estimators": 100,
        },
        {
            "num_leaves": 7,
            "max_depth": 3,
            "min_child_samples": 8,
            "learning_rate": 0.03,
            "n_estimators": 160,
        },
        {
            "num_leaves": 7,
            "max_depth": 3,
            "min_child_samples": 12,
            "learning_rate": 0.02,
            "n_estimators": 180,
        },
        {
            "num_leaves": 9,
            "max_depth": 4,
            "min_child_samples": 12,
            "learning_rate": 0.03,
            "n_estimators": 120,
        },
        {
            "num_leaves": 7,
            "max_depth": 3,
            "min_child_samples": 18,
            "learning_rate": 0.05,
            "n_estimators": 80,
        },
    )
    best_params = dict(BASE_LGBM_PARAMS)
    best_mae = base_mae
    best_index = 0
    for index, candidate in enumerate(candidates, start=1):
        params = {**BASE_LGBM_PARAMS, **candidate}
        model = build_residual_lightgbm(params)
        model.fit(train[list(V2_FEATURES)], train[RESIDUAL_TARGET])
        residual = model.predict(validation[list(V2_FEATURES)])
        final = reconstruct_from_residual(validation["occupancy_lag_1"], residual)
        mae = regression_metrics(validation[TARGET], final)["mae"]
        rows.append(
            {
                "configuration": f"candidate_{index}",
                **params,
                "validation_year": 2019,
                "validation_rows": len(validation),
                "validation_mae": mae,
                "persistence_mae": persistence_mae,
                "selected": False,
            }
        )
        if mae < best_mae:
            best_mae = mae
            best_params = params
            best_index = index
    rows[best_index]["selected"] = True
    return best_params, pd.DataFrame(rows)


def regional_metrics(predictions: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for (model_name, region), group in predictions.groupby(
        ["model_name", CATEGORICAL_FEATURE]
    ):
        metric = regression_metrics(
            group["actual_occupancy"], group["model_prediction"]
        )
        persistence = regression_metrics(
            group["actual_occupancy"], group["persistence_prediction"]
        )
        rows.append(
            {
                "model_name": model_name,
                CATEGORICAL_FEATURE: region,
                "rows": len(group),
                **metric,
                "signed_bias": float(group["signed_error"].mean()),
                "max_absolute_error": float(group["absolute_error"].max()),
                "persistence_mae": persistence["mae"],
                "improvement_vs_persistence": persistence["mae"] - metric["mae"],
                "regions_beating_persistence": int(metric["mae"] < persistence["mae"]),
            }
        )
    return pd.DataFrame(rows)


def source_era_diagnostics(
    data: pd.DataFrame, predictions: pd.DataFrame
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for model_name, group in predictions.groupby("model_name"):
        years_text = str(group["train_years"].iloc[0])
        years = tuple(int(value) for value in years_text.split(";") if value)
        train = common_eligible_rows(data, years) if years else data.iloc[0:0].copy()
        for region, region_test in group.groupby(CATEGORICAL_FEATURE):
            region_train = train.loc[train[CATEGORICAL_FEATURE] == region]
            rows.append(
                {
                    "model_name": model_name,
                    CATEGORICAL_FEATURE: region,
                    "test_rows": len(region_test),
                    "mean_signed_error": float(region_test["signed_error"].mean()),
                    "largest_absolute_error": float(
                        region_test["absolute_error"].max()
                    ),
                    "large_error_rows_over_15_points": int(
                        (region_test["absolute_error"] > 15).sum()
                    ),
                    "train_mean_occupancy": (
                        float(region_train[TARGET].mean())
                        if not region_train.empty
                        else float("nan")
                    ),
                    "test_mean_occupancy": float(
                        region_test["actual_occupancy"].mean()
                    ),
                    "train_source_granularities": (
                        ";".join(sorted(region_train["source_granularity"].unique()))
                        if not region_train.empty
                        else ""
                    ),
                    "test_source_granularities": "district",
                }
            )
    return pd.DataFrame(rows)


def make_v2_plots(
    predictions: pd.DataFrame, regional: pd.DataFrame, output_dir: Path
) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    output_dir.mkdir(parents=True, exist_ok=True)
    residual = predictions.loc[predictions["model_name"] == "residual_lightgbm_r2"]
    if residual.empty:
        residual = predictions.loc[
            predictions["model_name"].str.startswith("residual_lightgbm_r2")
        ]
    plt.figure(figsize=(6, 5))
    plt.scatter(residual["actual_residual"], residual["predicted_residual"], alpha=0.8)
    bounds = [
        min(residual["actual_residual"].min(), residual["predicted_residual"].min()),
        max(residual["actual_residual"].max(), residual["predicted_residual"].max()),
    ]
    plt.plot(bounds, bounds, "--", color="black", linewidth=1)
    plt.xlabel("Actual residual")
    plt.ylabel("Predicted residual")
    plt.title("Residual LightGBM: actual vs predicted residual")
    plt.tight_layout()
    plt.savefig(output_dir / "residual_actual_vs_predicted.png", dpi=160)
    plt.close()

    plt.figure(figsize=(6, 5))
    plt.scatter(residual["actual_occupancy"], residual["model_prediction"], alpha=0.8)
    bounds = [
        min(residual["actual_occupancy"].min(), residual["model_prediction"].min()),
        max(residual["actual_occupancy"].max(), residual["model_prediction"].max()),
    ]
    plt.plot(bounds, bounds, "--", color="black", linewidth=1)
    plt.xlabel("Actual occupancy")
    plt.ylabel("Model prediction")
    plt.title("Residual LightGBM: final actual vs predicted")
    plt.tight_layout()
    plt.savefig(output_dir / "final_actual_vs_predicted.png", dpi=160)
    plt.close()

    plt.figure(figsize=(6, 5))
    plt.scatter(
        residual["persistence_absolute_error"],
        residual["absolute_error"],
        alpha=0.8,
    )
    high = max(
        residual["persistence_absolute_error"].max(), residual["absolute_error"].max()
    )
    plt.plot([0, high], [0, high], "--", color="black", linewidth=1)
    plt.xlabel("Persistence absolute error")
    plt.ylabel("Model absolute error")
    plt.title("Persistence error vs residual-model error")
    plt.tight_layout()
    plt.savefig(output_dir / "persistence_vs_model_error.png", dpi=160)
    plt.close()

    table = regional.pivot(
        index=CATEGORICAL_FEATURE, columns="model_name", values="mae"
    )
    table.plot(kind="bar", figsize=(11, 5))
    plt.ylabel("MAE")
    plt.title("2024 MAE by region and model")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig(output_dir / "mae_by_region_v2.png", dpi=160)
    plt.close()


def _save_v2_artifact(
    artifact_dir: Path,
    model: Pipeline,
    metadata: dict[str, Any],
) -> tuple[Path, Path, Path, Path]:
    artifact_dir.mkdir(parents=True, exist_ok=True)
    canonical_model = artifact_dir / "visitor_pressure_model_v2.joblib"
    canonical_metadata = artifact_dir / "model_metadata_v2.json"
    version = metadata["model_version"]
    versioned_model = artifact_dir / f"visitor_pressure_model_{version}.joblib"
    versioned_metadata = artifact_dir / f"model_metadata_{version}.json"
    if versioned_model.exists() or versioned_metadata.exists():
        raise FileExistsError(f"Artifact version already exists: {version}")
    payload = {
        "model": model,
        "feature_names": list(V2_FEATURES),
        "target_type": "residual",
        "reconstruction": "occupancy_lag_1 + predicted_residual",
    }
    joblib.dump(payload, versioned_model)
    versioned_metadata.write_text(
        json.dumps(metadata, indent=2, sort_keys=True), encoding="utf-8"
    )
    promote = not canonical_model.exists() or not canonical_metadata.exists()
    if not promote:
        old = json.loads(canonical_metadata.read_text(encoding="utf-8"))
        promote = float(metadata["mae"]) <= float(old.get("mae", float("inf")))
    if promote:
        shutil.copy2(versioned_model, canonical_model)
        shutil.copy2(versioned_metadata, canonical_metadata)
    return canonical_model, canonical_metadata, versioned_model, versioned_metadata


def run_v2_experiments(
    data_path: Path,
    arrivals_path: Path,
    evaluation_dir: Path,
    artifact_dir: Path,
    *,
    created_at: datetime | None = None,
    create_plots: bool = True,
) -> dict[str, Any]:
    source = load_dataset(data_path)
    arrivals = load_monthly_arrivals(arrivals_path)
    assert_no_temporal_leakage(source, arrivals)
    data = add_leakage_safe_v2_features(source, arrivals)
    assert_v2_feature_integrity(data, arrivals)
    if data["year"].isin([2021, 2022, 2023]).any():
        raise ValueError("Unexpected occupancy targets in the 2021-2023 gap")

    best_params, search = choose_residual_parameters(data)
    search_was_run = len(search) > 1
    evaluation_dir.mkdir(parents=True, exist_ok=True)
    search.to_csv(evaluation_dir / "residual_search_v2.csv", index=False)

    test = common_eligible_rows(data, (2024,))
    if len(test) != len(test.index.unique()):
        raise ValueError("Duplicate test rows detected")
    prediction_frames: list[pd.DataFrame] = []
    metric_rows: list[dict[str, Any]] = []
    fitted_models: dict[str, Pipeline] = {}

    persistence_frame = _prediction_frame(
        test, test["occupancy_lag_1"], "persistence_baseline", None
    )
    seasonal_train = common_eligible_rows(data, (2017, 2018, 2019, 2020))
    seasonal_prediction = seasonal_baseline(seasonal_train, test)
    seasonal_frame = _prediction_frame(
        test, seasonal_prediction, "seasonal_baseline", (2017, 2018, 2019, 2020)
    )
    prediction_frames.extend([persistence_frame, seasonal_frame])
    metric_rows.append(
        _metric_row(
            persistence_frame,
            seasonal_prediction,
            "persistence_baseline",
            "baseline",
            None,
            "Primary baseline; prediction equals occupancy_lag_1.",
        )
    )
    metric_rows.append(
        _metric_row(
            seasonal_frame,
            seasonal_prediction,
            "seasonal_baseline",
            "baseline",
            (2017, 2018, 2019, 2020),
            "Training-only canonical-region/calendar-month mean.",
        )
    )

    train_r2 = common_eligible_rows(data, (2017, 2018, 2019, 2020))
    assert_temporal_separation(train_r2, test, (2017, 2018, 2019, 2020), 2024)
    direct = build_model(LAGGED_FEATURES)
    direct.fit(train_r2[list(LAGGED_FEATURES)], train_r2[TARGET])
    direct_prediction = direct.predict(test[list(LAGGED_FEATURES)])
    direct_frame = _prediction_frame(
        test,
        direct_prediction,
        "direct_lightgbm_v1",
        (2017, 2018, 2019, 2020),
    )
    prediction_frames.append(direct_frame)
    metric_rows.append(
        _metric_row(
            direct_frame,
            seasonal_prediction,
            "direct_lightgbm_v1",
            "direct_occupancy",
            (2017, 2018, 2019, 2020),
            "Existing fixed v1 LightGBM configuration, evaluated on the common v2 rows.",
        )
    )
    fitted_models["direct_lightgbm_v1"] = direct

    ridge = build_ridge()
    ridge.fit(train_r2[list(V2_FEATURES)], train_r2[TARGET])
    ridge_prediction = ridge.predict(test[list(V2_FEATURES)])
    ridge_frame = _prediction_frame(
        test, ridge_prediction, "ridge_direct", (2017, 2018, 2019, 2020)
    )
    prediction_frames.append(ridge_frame)
    metric_rows.append(
        _metric_row(
            ridge_frame,
            seasonal_prediction,
            "ridge_direct",
            "direct_occupancy",
            (2017, 2018, 2019, 2020),
            "Ridge(alpha=10) with training-fitted imputation, scaling, and one-hot region encoding.",
        )
    )
    fitted_models["ridge_direct"] = ridge

    for name, years in (
        ("residual_lightgbm_r1", (2017, 2018, 2019)),
        ("residual_lightgbm_r2", (2017, 2018, 2019, 2020)),
    ):
        train = common_eligible_rows(data, years)
        assert_temporal_separation(train, test, years, 2024)
        model = build_residual_lightgbm(best_params)
        model.fit(train[list(V2_FEATURES)], train[RESIDUAL_TARGET])
        predicted_residual = model.predict(test[list(V2_FEATURES)])
        prediction = reconstruct_from_residual(
            test["occupancy_lag_1"], predicted_residual
        )
        frame = _prediction_frame(test, prediction, name, years)
        prediction_frames.append(frame)
        model_seasonal_prediction = seasonal_baseline(train, test)
        metric_rows.append(
            _metric_row(
                frame,
                model_seasonal_prediction,
                name,
                "residual",
                years,
                "Predicts occupancy_rate - occupancy_lag_1, then adds occupancy_lag_1. "
                + (
                    "Small parameter search selected on 2019 only."
                    if search_was_run
                    else "Base configuration retained because it did not beat persistence on 2019 validation; no search was run."
                ),
            )
        )
        fitted_models[name] = model

    predictions = pd.concat(prediction_frames, ignore_index=True)
    metrics = pd.DataFrame(metric_rows)
    if metrics["test_rows"].nunique() != 1:
        raise ValueError("Models and persistence were not compared on identical rows")
    key_columns = ["date", CATEGORICAL_FEATURE]
    expected_keys = set(map(tuple, test[key_columns].to_numpy()))
    for model_name, group in predictions.groupby("model_name"):
        if set(map(tuple, group[key_columns].to_numpy())) != expected_keys:
            raise ValueError(f"{model_name} does not use the common test rows")

    regional = regional_metrics(predictions)
    diagnostics = source_era_diagnostics(data, predictions)
    metrics.to_csv(evaluation_dir / "model_comparison_v2.csv", index=False)
    predictions.to_csv(evaluation_dir / "test_predictions_v2.csv", index=False)
    regional.to_csv(evaluation_dir / "mae_by_region_v2.csv", index=False)
    diagnostics.to_csv(evaluation_dir / "region_diagnostics_v2.csv", index=False)
    if create_plots:
        make_v2_plots(predictions, regional, evaluation_dir / "plots_v2")

    persistence_mae = float(
        metrics.loc[metrics["model_name"] == "persistence_baseline", "mae"].iloc[0]
    )
    candidates = metrics.loc[
        ~metrics["model_name"].isin(["persistence_baseline", "seasonal_baseline"])
    ].sort_values("mae")
    best = candidates.iloc[0]
    selected_model = (
        str(best["model_name"])
        if float(best["improvement_vs_persistence"]) > 0
        else "persistence_baseline"
    )
    residual_candidates = metrics.loc[
        metrics["model_name"].str.startswith("residual_lightgbm")
    ].sort_values("mae")
    best_residual = residual_candidates.iloc[0]
    artifact_paths: list[str] = []
    if float(best_residual["improvement_vs_persistence"]) > 0:
        model_name = str(best_residual["model_name"])
        timestamp = created_at or datetime.now(UTC)
        version = f"v2_{timestamp.strftime('%Y%m%dT%H%M%SZ')}_{model_name}"
        model_predictions = predictions.loc[predictions["model_name"] == model_name]
        metadata = {
            "schema_version": 2,
            "model_version": version,
            "algorithm": "LightGBM residual regressor inside a scikit-learn preprocessing pipeline",
            "target": TARGET,
            "target_type": "residual",
            "residual_target": "occupancy_rate - occupancy_lag_1",
            "feature_names": list(V2_FEATURES),
            "categorical_handling": "Training-fitted OneHotEncoder(handle_unknown='ignore') inside the saved pipeline.",
            "training_years": [
                int(value) for value in str(best_residual["train_years"]).split(";")
            ],
            "test_year": 2024,
            "test_rows": int(best_residual["test_rows"]),
            "evaluated_regions": sorted(
                model_predictions[CATEGORICAL_FEATURE].unique()
            ),
            "mae": float(best_residual["mae"]),
            "rmse": float(best_residual["rmse"]),
            "r2": float(best_residual["r2"]),
            "persistence_baseline_mae": persistence_mae,
            "improvement_vs_persistence": float(
                best_residual["improvement_vs_persistence"]
            ),
            "seasonal_baseline_mae": float(best_residual["seasonal_mae"]),
            "prediction_interpretation": "One-month-ahead walk-forward prediction reconstructed as occupancy_lag_1 + predicted residual.",
            "known_limitations": "Small dataset; 2021-2023 occupancy gap; only April-December 2024 has three exact occupancy lags; district-to-region aggregation and source-era changes; final evidence is one test year.",
            "created_timestamp": timestamp.isoformat(),
        }
        paths = _save_v2_artifact(artifact_dir, fitted_models[model_name], metadata)
        artifact_paths = [str(path) for path in paths]
        loaded = joblib.load(paths[0])
        loaded_residual = loaded["model"].predict(test[list(V2_FEATURES)])
        round_trip = reconstruct_from_residual(test["occupancy_lag_1"], loaded_residual)
        if round_trip.shape != (len(test),) or not np.isfinite(round_trip).all():
            raise ValueError("v2 artifact failed prediction round trip")

    summary = {
        "common_test_rows": len(test),
        "persistence_mae": persistence_mae,
        "best_non_baseline_model": str(best["model_name"]),
        "best_non_baseline_mae": float(best["mae"]),
        "selected_model": selected_model,
        "persistence_remains_strongest": selected_model == "persistence_baseline",
        "residual_search_run": search_was_run,
        "artifact_paths": artifact_paths,
    }
    (evaluation_dir / "run_summary_v2.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    return {
        "data": data,
        "metrics": metrics,
        "predictions": predictions,
        "regional": regional,
        "diagnostics": diagnostics,
        "search": search,
        "summary": summary,
    }
