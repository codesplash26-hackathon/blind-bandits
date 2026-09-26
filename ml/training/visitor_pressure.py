"""Leakage-safe visitor-pressure model training and evaluation utilities."""

from __future__ import annotations

import json
import math
import shutil
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

RANDOM_SEED = 42
TARGET = "occupancy_rate"
CATEGORICAL_FEATURE = "canonical_region"
NO_LAG_FEATURES = (
    CATEGORICAL_FEATURE,
    "month_sin",
    "month_cos",
    "arrivals_lag_1",
    "arrivals_rolling_3",
)
LAGGED_FEATURES = NO_LAG_FEATURES + (
    "occupancy_lag_1",
    "occupancy_lag_2",
    "occupancy_lag_3",
    "occupancy_rolling_3",
)
FORBIDDEN_MODEL_FEATURES = {
    TARGET,
    "total_arrivals",
    "arrivals_growth_1m",
    "date",
    "year",
    "month",
    "target_available",
}

FEATURE_AVAILABILITY = {
    "canonical_region": ("available_at_prediction_time", "Known forecast geography."),
    "month_sin": ("available_at_prediction_time", "Derived from the forecast month."),
    "month_cos": ("available_at_prediction_time", "Derived from the forecast month."),
    "arrivals_lag_1": (
        "available_at_prediction_time",
        "Final prior-month national arrivals.",
    ),
    "arrivals_rolling_3": (
        "available_at_prediction_time",
        "Mean of the three prior calendar months only.",
    ),
    "occupancy_lag_1": (
        "available_at_prediction_time",
        "Actual prior-month regional occupancy in walk-forward use.",
    ),
    "occupancy_lag_2": (
        "available_at_prediction_time",
        "Actual occupancy two calendar months earlier.",
    ),
    "occupancy_lag_3": (
        "available_at_prediction_time",
        "Actual occupancy three calendar months earlier.",
    ),
    "occupancy_rolling_3": (
        "available_at_prediction_time",
        "Mean of the three prior occupancy observations only.",
    ),
    "is_pandemic_period": (
        "available_at_prediction_time",
        "Calendar regime flag; retained for audit but not used by the models.",
    ),
    "total_arrivals": (
        "unavailable_at_prediction_time",
        "Final same-month arrivals are not known one month ahead.",
    ),
    "arrivals_growth_1m": (
        "unavailable_at_prediction_time",
        "Existing field uses final same-month arrivals versus lag 1.",
    ),
    "occupancy_rate": ("unavailable_at_prediction_time", "Prediction target."),
    "room_capacity": (
        "uncertain",
        "May be known, but source coverage and establishment populations differ by year.",
    ),
    "source_granularity": (
        "unavailable_at_prediction_time",
        "Source/audit metadata, not a forecast signal.",
    ),
    "aggregation_method": (
        "unavailable_at_prediction_time",
        "Source/audit metadata, not a forecast signal.",
    ),
    "source_district_count": (
        "uncertain",
        "Depends on reporting and aggregation availability.",
    ),
    "source_years": ("unavailable_at_prediction_time", "Source/audit metadata."),
    "needs_manual_review": ("unavailable_at_prediction_time", "Data-quality metadata."),
}


@dataclass(frozen=True)
class Experiment:
    name: str
    train_years: tuple[int, ...]
    validation_year: int | None
    test_year: int = 2024


EXPERIMENTS = (
    Experiment("A", (2017, 2018, 2019), 2020),
    Experiment("B", (2017, 2018, 2019, 2020), None),
    Experiment("C", (2017, 2018, 2019), None),
)


def load_dataset(path: Path) -> pd.DataFrame:
    data = pd.read_csv(path, parse_dates=["date"])
    required = {"date", "year", "month", CATEGORICAL_FEATURE, TARGET}
    missing = required - set(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")
    data = data.sort_values(["date", CATEGORICAL_FEATURE]).reset_index(drop=True)
    if data.duplicated(["date", CATEGORICAL_FEATURE]).any():
        raise ValueError("Duplicate date/canonical_region rows detected")
    if data[TARGET].isna().any() or not np.isfinite(data[TARGET]).all():
        raise ValueError("Target values must be finite and non-missing")
    if not data[TARGET].between(0, 100).all():
        raise ValueError("occupancy_rate must remain on the 0-100 scale")
    return data


def load_monthly_arrivals(path: Path) -> pd.DataFrame:
    arrivals = pd.read_csv(path)
    arrivals["date"] = pd.to_datetime(
        {"year": arrivals["year"], "month": arrivals["month"], "day": 1}
    )
    if arrivals.duplicated("date").any():
        raise ValueError("Duplicate monthly-arrival dates detected")
    return arrivals.sort_values("date").reset_index(drop=True)


def assert_temporal_separation(
    train: pd.DataFrame, test: pd.DataFrame, train_years: Sequence[int], test_year: int
) -> None:
    if train.empty or test.empty:
        raise ValueError("Train and test sets must both be non-empty")
    if set(train["year"].unique()) - set(train_years):
        raise ValueError("Training data includes an unauthorized year")
    if set(test["year"].unique()) != {test_year}:
        raise ValueError("Test data is not confined to the requested test year")
    if train["date"].max() >= test["date"].min():
        raise ValueError("Train/test temporal overlap detected")


def assert_feature_schema(features: Sequence[str]) -> None:
    if CATEGORICAL_FEATURE not in features:
        raise ValueError(
            "canonical_region must be included and encoded by the pipeline"
        )
    leaked = set(features) & FORBIDDEN_MODEL_FEATURES
    if leaked:
        raise ValueError(f"Forbidden/leaky model features: {', '.join(sorted(leaked))}")
    unknown = [name for name in features if name not in FEATURE_AVAILABILITY]
    if unknown:
        raise ValueError(f"Features have no prediction-time classification: {unknown}")
    unavailable = [
        name
        for name in features
        if FEATURE_AVAILABILITY[name][0] != "available_at_prediction_time"
    ]
    if unavailable:
        raise ValueError(
            f"Features are not available at prediction time: {unavailable}"
        )


def assert_no_temporal_leakage(
    data: pd.DataFrame, monthly_arrivals: pd.DataFrame
) -> None:
    """Recompute every history feature from exact prior calendar months."""
    occupancy = data.set_index([CATEGORICAL_FEATURE, "date"])[TARGET].to_dict()
    arrival_lookup = monthly_arrivals.set_index("date")["total_arrivals"].to_dict()
    tolerance = 1e-6
    for row in data.itertuples(index=False):
        for lag in (1, 2, 3):
            prior_date = row.date - pd.DateOffset(months=lag)
            expected = occupancy.get((row.canonical_region, prior_date), np.nan)
            actual = getattr(row, f"occupancy_lag_{lag}")
            if pd.isna(expected) != pd.isna(actual) or (
                not pd.isna(expected)
                and not math.isclose(float(actual), float(expected), abs_tol=tolerance)
            ):
                raise ValueError(
                    f"occupancy_lag_{lag} leakage/misalignment at {row.date} {row.canonical_region}"
                )

        prior_occupancy = [
            occupancy.get(
                (row.canonical_region, row.date - pd.DateOffset(months=lag)), np.nan
            )
            for lag in (1, 2, 3)
        ]
        expected_occ_roll = (
            float(np.mean(prior_occupancy))
            if not any(pd.isna(prior_occupancy))
            else np.nan
        )
        if pd.isna(expected_occ_roll) != pd.isna(row.occupancy_rolling_3) or (
            not pd.isna(expected_occ_roll)
            and not math.isclose(
                float(row.occupancy_rolling_3), expected_occ_roll, abs_tol=tolerance
            )
        ):
            raise ValueError(
                f"occupancy_rolling_3 includes current/misaligned data at {row.date} {row.canonical_region}"
            )

        expected_arrival_lag = arrival_lookup.get(
            row.date - pd.DateOffset(months=1), np.nan
        )
        if pd.isna(expected_arrival_lag) != pd.isna(row.arrivals_lag_1) or (
            not pd.isna(expected_arrival_lag)
            and not math.isclose(
                float(row.arrivals_lag_1),
                float(expected_arrival_lag),
                abs_tol=tolerance,
            )
        ):
            raise ValueError(f"arrivals_lag_1 leakage/misalignment at {row.date}")
        prior_arrivals = [
            arrival_lookup.get(row.date - pd.DateOffset(months=lag), np.nan)
            for lag in (1, 2, 3)
        ]
        expected_arrival_roll = (
            float(np.mean(prior_arrivals))
            if not any(pd.isna(prior_arrivals))
            else np.nan
        )
        if pd.isna(expected_arrival_roll) != pd.isna(row.arrivals_rolling_3) or (
            not pd.isna(expected_arrival_roll)
            and not math.isclose(
                float(row.arrivals_rolling_3), expected_arrival_roll, abs_tol=tolerance
            )
        ):
            raise ValueError(
                f"arrivals_rolling_3 includes current/misaligned data at {row.date}"
            )

    january_2024 = data.loc[(data["year"] == 2024) & (data["month"] == 1)]
    occupancy_history = [
        "occupancy_lag_1",
        "occupancy_lag_2",
        "occupancy_lag_3",
        "occupancy_rolling_3",
    ]
    if january_2024.empty or january_2024[occupancy_history].notna().any().any():
        raise ValueError(
            "2024 January improperly borrows occupancy across the 2021-2023 gap"
        )


def seasonal_baseline(train: pd.DataFrame, evaluation: pd.DataFrame) -> np.ndarray:
    """Training-only region/month historical means; missing groups fail loudly."""
    means = train.groupby([CATEGORICAL_FEATURE, "month"], observed=True)[TARGET].mean()
    predictions: list[float] = []
    for row in evaluation.itertuples(index=False):
        key = (row.canonical_region, row.month)
        if key not in means.index:
            raise ValueError(f"No training seasonal baseline for {key}")
        predictions.append(float(means.loc[key]))
    return np.asarray(predictions)


def persistence_baseline(evaluation: pd.DataFrame) -> np.ndarray:
    return evaluation["occupancy_lag_1"].to_numpy(dtype=float, copy=True)


def regression_metrics(
    actual: Iterable[float], predicted: Iterable[float]
) -> dict[str, float]:
    actual_values = np.asarray(list(actual), dtype=float)
    predicted_values = np.asarray(list(predicted), dtype=float)
    if actual_values.shape != predicted_values.shape or actual_values.size == 0:
        raise ValueError("Metrics require equal non-empty actual and prediction arrays")
    if not np.isfinite(predicted_values).all():
        raise ValueError("Predictions must be finite")
    return {
        "mae": float(mean_absolute_error(actual_values, predicted_values)),
        "rmse": float(mean_squared_error(actual_values, predicted_values) ** 0.5),
        "r2": float(r2_score(actual_values, predicted_values))
        if actual_values.size >= 2 and np.var(actual_values) > 0
        else float("nan"),
    }


def build_model(features: Sequence[str]) -> Pipeline:
    assert_feature_schema(features)
    numeric = [name for name in features if name != CATEGORICAL_FEATURE]
    # One small fixed configuration: no test-set tuning.
    regressor = LGBMRegressor(
        objective="regression_l1",
        n_estimators=120,
        learning_rate=0.03,
        num_leaves=7,
        max_depth=3,
        min_child_samples=12,
        subsample=1.0,
        colsample_bytree=1.0,
        reg_alpha=0.0,
        reg_lambda=0.1,
        random_state=RANDOM_SEED,
        n_jobs=1,
        verbosity=-1,
    )
    transformer = ColumnTransformer(
        [
            (
                "region",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                [CATEGORICAL_FEATURE],
            ),
            ("numeric", "passthrough", numeric),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    return Pipeline([("preprocessing", transformer), ("regressor", regressor)])


def eligible_rows(
    data: pd.DataFrame, years: Sequence[int], features: Sequence[str]
) -> pd.DataFrame:
    return data.loc[data["year"].isin(years)].dropna(subset=[TARGET, *features]).copy()


def _regions_text(frame: pd.DataFrame) -> str:
    return ";".join(sorted(frame[CATEGORICAL_FEATURE].unique()))


def evaluate_one(
    data: pd.DataFrame,
    experiment: Experiment,
    model_name: str,
    features: Sequence[str],
    evaluation_year: int,
    evaluation_label: str,
) -> tuple[dict[str, Any], pd.DataFrame, Pipeline]:
    train = eligible_rows(data, experiment.train_years, features)
    evaluation = eligible_rows(data, (evaluation_year,), features)
    assert_temporal_separation(
        train, evaluation, experiment.train_years, evaluation_year
    )
    model = build_model(features)
    model.fit(train[list(features)], train[TARGET])
    predicted = model.predict(evaluation[list(features)])
    seasonal = seasonal_baseline(train, evaluation)
    persistence = persistence_baseline(evaluation)
    model_metrics = regression_metrics(evaluation[TARGET], predicted)
    seasonal_metrics = regression_metrics(evaluation[TARGET], seasonal)
    persistence_mask = np.isfinite(persistence)
    persistence_metrics = (
        regression_metrics(
            evaluation.loc[persistence_mask, TARGET], persistence[persistence_mask]
        )
        if persistence_mask.any()
        else {"mae": float("nan"), "rmse": float("nan"), "r2": float("nan")}
    )
    if len(predicted) != len(evaluation):
        raise ValueError("Prediction shape does not match evaluation rows")

    result = evaluation[["date", "year", "month", CATEGORICAL_FEATURE, TARGET]].copy()
    result = result.rename(columns={TARGET: "actual_occupancy"})
    result["predicted_occupancy"] = predicted
    result["seasonal_baseline"] = seasonal
    result["persistence_baseline"] = persistence
    result["absolute_error"] = np.abs(
        result["actual_occupancy"] - result["predicted_occupancy"]
    )
    result["model_name"] = model_name
    result["experiment"] = experiment.name
    result["evaluation_role"] = evaluation_label

    notes = "One-month-ahead walk-forward evaluation."
    if model_name == "lightgbm_lagged":
        notes += " Later 2024 months use actual earlier-2024 occupancy; this is not a 12-month-ahead forecast."
    if experiment.name == "A":
        notes += (
            " 2020 is evaluated separately as abnormal-regime diagnostic validation."
        )
    metric_row: dict[str, Any] = {
        "experiment": experiment.name,
        "model_name": model_name,
        "feature_set": ";".join(features),
        "train_years": ";".join(map(str, experiment.train_years)),
        "train_rows": len(train),
        "validation_year": experiment.validation_year or "",
        "test_year": evaluation_year,
        "evaluation_role": evaluation_label,
        "test_rows": len(evaluation),
        "regions": _regions_text(evaluation),
        **model_metrics,
        "baseline_mae": seasonal_metrics["mae"],
        "seasonal_baseline_rmse": seasonal_metrics["rmse"],
        "seasonal_baseline_r2": seasonal_metrics["r2"],
        "persistence_rows": int(persistence_mask.sum()),
        "persistence_mae": persistence_metrics["mae"],
        "persistence_rmse": persistence_metrics["rmse"],
        "persistence_r2": persistence_metrics["r2"],
        "mae_improvement_vs_baseline": seasonal_metrics["mae"] - model_metrics["mae"],
        "pandemic_in_training": 2020 in experiment.train_years,
        "notes": notes,
    }
    return metric_row, result, model


def eda_tables(data: pd.DataFrame) -> dict[str, pd.DataFrame]:
    distribution = (
        data[TARGET]
        .describe(percentiles=[0.25, 0.5, 0.75])
        .rename_axis("statistic")
        .reset_index(name="occupancy_rate")
    )
    missing_fields = [
        *NO_LAG_FEATURES[1:],
        *LAGGED_FEATURES[len(NO_LAG_FEATURES) :],
        "arrivals_growth_1m",
    ]
    return {
        "occupancy_by_year": data.groupby("year")[TARGET]
        .agg(["count", "mean", "median", "min", "max"])
        .reset_index(),
        "occupancy_by_region": data.groupby(CATEGORICAL_FEATURE)[TARGET]
        .agg(["count", "mean", "median", "min", "max"])
        .reset_index(),
        "occupancy_by_month": data.groupby("month")[TARGET]
        .agg(["count", "mean", "median", "min", "max"])
        .reset_index(),
        "occupancy_distribution": distribution,
        "pandemic_comparison": data.assign(
            regime=np.where(data["is_pandemic_period"], "pandemic_2020", "non_pandemic")
        )
        .groupby("regime")[TARGET]
        .agg(["count", "mean", "median", "min", "max"])
        .reset_index(),
        "missing_features": pd.DataFrame(
            {
                "feature": missing_fields,
                "missing_count": [
                    int(data[name].isna().sum()) for name in missing_fields
                ],
                "available_count": [
                    int(data[name].notna().sum()) for name in missing_fields
                ],
            }
        ),
        "candidate_counts": data.groupby(["year", CATEGORICAL_FEATURE])
        .size()
        .reset_index(name="candidate_rows"),
    }


def feature_audit_table() -> pd.DataFrame:
    rows = []
    used = set(NO_LAG_FEATURES) | set(LAGGED_FEATURES)
    for feature, (classification, reason) in FEATURE_AVAILABILITY.items():
        rows.append(
            {
                "feature": feature,
                "classification": classification,
                "used_by_model": feature in used,
                "reason": reason,
            }
        )
    return pd.DataFrame(rows).sort_values(["classification", "feature"])


def region_metrics(predictions: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    final = predictions.loc[predictions["evaluation_role"] == "final_test"]
    for (experiment, model_name, region), group in final.groupby(
        ["experiment", "model_name", CATEGORICAL_FEATURE]
    ):
        model_metric = regression_metrics(
            group["actual_occupancy"], group["predicted_occupancy"]
        )
        seasonal_metric = regression_metrics(
            group["actual_occupancy"], group["seasonal_baseline"]
        )
        rows.append(
            {
                "experiment": experiment,
                "model_name": model_name,
                CATEGORICAL_FEATURE: region,
                "rows": len(group),
                **model_metric,
                "seasonal_baseline_mae": seasonal_metric["mae"],
                "mae_improvement_vs_baseline": seasonal_metric["mae"]
                - model_metric["mae"],
            }
        )
    return pd.DataFrame(rows)


def select_candidate(metrics: pd.DataFrame, regional: pd.DataFrame) -> pd.Series:
    final = metrics.loc[metrics["evaluation_role"] == "final_test"].copy()
    winners = final.loc[final["mae_improvement_vs_baseline"] > 0].copy()
    if winners.empty:
        # Still retain the best honest candidate for reproducibility, clearly marked as not beating baseline.
        winners = final.copy()
    stability = (
        regional.groupby(["experiment", "model_name"])["mae"]
        .max()
        .rename("max_region_mae")
    )
    winners = winners.join(stability, on=["experiment", "model_name"])
    winners = winners.sort_values(
        ["mae", "max_region_mae", "test_rows"], ascending=[True, True, False]
    )
    return winners.iloc[0]


def save_artifacts(
    artifact_dir: Path, model: Pipeline, metadata: dict[str, Any], version: str
) -> tuple[Path, Path, Path, Path]:
    artifact_dir.mkdir(parents=True, exist_ok=True)
    versioned_model = artifact_dir / f"visitor_pressure_model_{version}.joblib"
    versioned_metadata = artifact_dir / f"model_metadata_{version}.json"
    canonical_model = artifact_dir / "visitor_pressure_model.joblib"
    canonical_metadata = artifact_dir / "model_metadata.json"
    if versioned_model.exists() or versioned_metadata.exists():
        raise FileExistsError(f"Versioned artifact already exists: {version}")
    joblib.dump(model, versioned_model)
    versioned_metadata.write_text(
        json.dumps(metadata, indent=2, sort_keys=True), encoding="utf-8"
    )

    replace_canonical = not canonical_model.exists() or not canonical_metadata.exists()
    if not replace_canonical:
        old = json.loads(canonical_metadata.read_text(encoding="utf-8"))
        comparable = (
            old.get("test_year") == metadata["test_year"]
            and old.get("evaluated_regions") == metadata["evaluated_regions"]
            and old.get("test_rows") == metadata["test_rows"]
            and old.get("feature_names") == metadata["feature_names"]
        )
        replace_canonical = comparable and float(metadata["mae"]) <= float(
            old.get("mae", float("inf"))
        )
    if replace_canonical:
        shutil.copy2(versioned_model, canonical_model)
        shutil.copy2(versioned_metadata, canonical_metadata)
    return versioned_model, versioned_metadata, canonical_model, canonical_metadata


def make_plots(
    data: pd.DataFrame,
    predictions: pd.DataFrame,
    regional: pd.DataFrame,
    plot_dir: Path,
) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plot_dir.mkdir(parents=True, exist_ok=True)
    plt.figure(figsize=(7, 4))
    plt.hist(data[TARGET], bins=20, color="#1f77b4", edgecolor="white")
    plt.xlabel("Occupancy rate")
    plt.ylabel("Rows")
    plt.title("Occupancy distribution")
    plt.tight_layout()
    plt.savefig(plot_dir / "occupancy_distribution.png", dpi=160)
    plt.close()

    final = predictions.loc[predictions["evaluation_role"] == "final_test"]
    for (experiment, model_name), group in final.groupby(["experiment", "model_name"]):
        stem = f"experiment_{experiment}_{model_name}"
        plt.figure(figsize=(6, 5))
        plt.scatter(group["actual_occupancy"], group["predicted_occupancy"], alpha=0.75)
        low = min(group["actual_occupancy"].min(), group["predicted_occupancy"].min())
        high = max(group["actual_occupancy"].max(), group["predicted_occupancy"].max())
        plt.plot([low, high], [low, high], "--", color="black", linewidth=1)
        plt.xlabel("Actual occupancy")
        plt.ylabel("Predicted occupancy")
        plt.title(f"Actual vs predicted — {experiment} {model_name}")
        plt.tight_layout()
        plt.savefig(plot_dir / f"{stem}_actual_vs_predicted.png", dpi=160)
        plt.close()

        residual = group["actual_occupancy"] - group["predicted_occupancy"]
        plt.figure(figsize=(6, 4))
        plt.hist(residual, bins=15, color="#ff7f0e", edgecolor="white")
        plt.axvline(0, linestyle="--", color="black", linewidth=1)
        plt.xlabel("Residual (actual - predicted)")
        plt.ylabel("Rows")
        plt.title(f"Residual distribution — {experiment} {model_name}")
        plt.tight_layout()
        plt.savefig(plot_dir / f"{stem}_residuals.png", dpi=160)
        plt.close()

        monthly = group.groupby("month")[
            ["actual_occupancy", "predicted_occupancy"]
        ].mean()
        plt.figure(figsize=(7, 4))
        plt.plot(monthly.index, monthly["actual_occupancy"], marker="o", label="Actual")
        plt.plot(
            monthly.index, monthly["predicted_occupancy"], marker="o", label="Predicted"
        )
        plt.xticks(range(1, 13))
        plt.xlabel("Month")
        plt.ylabel("Mean occupancy")
        plt.title(f"Actual vs predicted by month — {experiment} {model_name}")
        plt.legend()
        plt.tight_layout()
        plt.savefig(plot_dir / f"{stem}_by_month.png", dpi=160)
        plt.close()

    for model_name, group in regional.groupby("model_name"):
        pivot = group.groupby(CATEGORICAL_FEATURE)["mae"].mean().sort_values()
        plt.figure(figsize=(8, 4))
        pivot.plot(kind="bar", color="#2ca02c")
        plt.ylabel("MAE")
        plt.title(f"2024 MAE by canonical region — {model_name}")
        plt.xticks(rotation=30, ha="right")
        plt.tight_layout()
        plt.savefig(plot_dir / f"{model_name}_mae_by_region.png", dpi=160)
        plt.close()


def run_training(
    data_path: Path,
    arrivals_path: Path,
    evaluation_dir: Path,
    artifact_dir: Path,
    *,
    created_at: datetime | None = None,
    create_plots: bool = True,
) -> dict[str, Any]:
    data = load_dataset(data_path)
    arrivals = load_monthly_arrivals(arrivals_path)
    assert_feature_schema(NO_LAG_FEATURES)
    assert_feature_schema(LAGGED_FEATURES)
    assert_no_temporal_leakage(data, arrivals)
    if data["year"].isin([2021, 2022, 2023]).any():
        raise ValueError("Fabricated/interpolated 2021-2023 targets detected")

    evaluation_dir.mkdir(parents=True, exist_ok=True)
    eda_dir = evaluation_dir / "eda"
    eda_dir.mkdir(parents=True, exist_ok=True)
    for name, table in eda_tables(data).items():
        table.to_csv(eda_dir / f"{name}.csv", index=False)
    feature_audit_table().to_csv(
        evaluation_dir / "feature_availability_audit.csv", index=False
    )

    metrics_rows: list[dict[str, Any]] = []
    prediction_frames: list[pd.DataFrame] = []
    models: dict[tuple[str, str], Pipeline] = {}
    variants = (
        ("lightgbm_no_lag", NO_LAG_FEATURES),
        ("lightgbm_lagged", LAGGED_FEATURES),
    )
    for experiment in EXPERIMENTS:
        for model_name, features in variants:
            metric, prediction, model = evaluate_one(
                data, experiment, model_name, features, 2024, "final_test"
            )
            metrics_rows.append(metric)
            prediction_frames.append(prediction)
            models[(experiment.name, model_name)] = model
            if experiment.validation_year is not None:
                val_metric, val_prediction, _ = evaluate_one(
                    data,
                    experiment,
                    model_name,
                    features,
                    experiment.validation_year,
                    "diagnostic_validation",
                )
                metrics_rows.append(val_metric)
                prediction_frames.append(val_prediction)

    metrics = pd.DataFrame(metrics_rows)
    predictions = pd.concat(prediction_frames, ignore_index=True).sort_values(
        ["evaluation_role", "experiment", "model_name", "date", CATEGORICAL_FEATURE]
    )
    regional = region_metrics(predictions)
    metrics.to_csv(evaluation_dir / "model_comparison.csv", index=False)
    predictions.loc[predictions["evaluation_role"] == "final_test"].to_csv(
        evaluation_dir / "test_predictions.csv", index=False
    )
    predictions.loc[predictions["evaluation_role"] == "diagnostic_validation"].to_csv(
        evaluation_dir / "validation_predictions.csv", index=False
    )
    regional.to_csv(evaluation_dir / "mae_by_region.csv", index=False)
    if create_plots:
        make_plots(data, predictions, regional, evaluation_dir / "plots")

    selected = select_candidate(metrics, regional)
    selected_key = (str(selected["experiment"]), str(selected["model_name"]))
    selected_model = models[selected_key]
    selected_features = (
        NO_LAG_FEATURES if selected_key[1] == "lightgbm_no_lag" else LAGGED_FEATURES
    )
    timestamp = created_at or datetime.now(UTC)
    version = f"v1_{timestamp.strftime('%Y%m%dT%H%M%SZ')}_{selected_key[0]}_{'no_lag' if selected_key[1] == 'lightgbm_no_lag' else 'lagged'}"
    selected_regions = str(selected["regions"]).split(";")
    metadata: dict[str, Any] = {
        "schema_version": 1,
        "model_version": version,
        "algorithm": "LightGBM LGBMRegressor inside a scikit-learn Pipeline",
        "target": TARGET,
        "feature_names": list(selected_features),
        "categorical_handling": "Fitted OneHotEncoder(handle_unknown='ignore') saved inside the model pipeline.",
        "training_years": [
            int(year) for year in str(selected["train_years"]).split(";")
        ],
        "training_rows": int(selected["train_rows"]),
        "test_year": int(selected["test_year"]),
        "test_rows": int(selected["test_rows"]),
        "prediction_interpretation": "One-month-ahead walk-forward regional occupancy forecast. If occupancy lags are used, later months may use actual earlier-month occupancy; this is not a 12-month-ahead forecast.",
        "evaluated_regions": selected_regions,
        "mae": float(selected["mae"]),
        "rmse": float(selected["rmse"]),
        "r2": float(selected["r2"]),
        "seasonal_baseline_mae": float(selected["baseline_mae"]),
        "improvement_vs_baseline": float(selected["mae_improvement_vs_baseline"]),
        "beats_seasonal_baseline": bool(selected["mae_improvement_vs_baseline"] > 0),
        "persistence_baseline_mae": float(selected["persistence_mae"]),
        "beats_persistence_baseline": bool(
            selected["mae"] < selected["persistence_mae"]
        ),
        "pandemic_data_included": bool(selected["pandemic_in_training"]),
        "known_2021_2023_gap": "No monthly occupancy targets exist and none were fabricated or interpolated.",
        "aggregation_caveats": "2020/2024 district targets are room-weighted into defensible canonical regions. 2024 weights use registered-accommodation room capacity while occupancy covers graded establishments. Colombo City has no defensible 2020/2024 target.",
        "same_month_arrivals_excluded": True,
        "candidate_status": "Experimental candidate; not production-ready because persistence is stronger and regional performance is mixed.",
        "created_timestamp": timestamp.isoformat(),
        "selection_rule": "Lowest 2024 MAE among models beating their same-row seasonal baseline; ties consider worst-region MAE then coverage. If none beat baseline, retain the lowest-MAE candidate and state that limitation.",
    }
    paths = save_artifacts(artifact_dir, selected_model, metadata, version)
    loaded = joblib.load(paths[0])
    selected_test = eligible_rows(data, (2024,), selected_features)
    round_trip = loaded.predict(selected_test[list(selected_features)])
    if round_trip.shape != (len(selected_test),) or not np.isfinite(round_trip).all():
        raise ValueError("Saved artifact failed prediction round-trip validation")

    summary = {
        "selected_experiment": selected_key[0],
        "selected_model": selected_key[1],
        "selected_model_version": version,
        "beats_seasonal_baseline": metadata["beats_seasonal_baseline"],
        "evaluated_regions_2024": sorted(
            data.loc[data["year"] == 2024, CATEGORICAL_FEATURE].unique()
        ),
        "artifact_paths": [str(path) for path in paths],
    }
    (evaluation_dir / "run_summary.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    return {
        "metrics": metrics,
        "predictions": predictions,
        "regional": regional,
        "metadata": metadata,
        "summary": summary,
    }
