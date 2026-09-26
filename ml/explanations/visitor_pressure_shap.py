"""TreeSHAP explanations for the selected v2 residual visitor-pressure model.

SHAP values in this module explain the learned ``predicted_residual``.  Final
occupancy is reconstructed separately as ``occupancy_lag_1 + predicted_residual``.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import matplotlib
import numpy as np
import pandas as pd
import shap
from lightgbm import LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from ml.training.visitor_pressure import load_dataset, load_monthly_arrivals
from ml.training.visitor_pressure_v2 import (
    V2_FEATURES,
    add_leakage_safe_v2_features,
    common_eligible_rows,
)

matplotlib.use("Agg")

ADDIVITY_TOLERANCE = 1e-6
EXPLANATION_WORDING_VERSION = "visitor-pressure-template-v1"
PREDICTION_TYPE = "regional_monthly_occupancy"
FORECAST_MODE = "one_month_ahead_walk_forward"

FEATURE_LABELS: dict[str, str] = {
    "canonical_region": "Tourism region",
    "month": "Forecast month",
    "month_sin": "Seasonality (sine component)",
    "month_cos": "Seasonality (cosine component)",
    "arrivals_lag_1": "Previous month's tourist arrivals",
    "arrivals_lag_2": "Tourist arrivals two months ago",
    "arrivals_lag_3": "Tourist arrivals three months ago",
    "arrivals_growth_lagged": "Recent tourist arrival growth",
    "arrivals_change_lag_1": "Recent change in tourist arrivals",
    "occupancy_lag_1": "Previous month's occupancy",
    "occupancy_lag_2": "Occupancy two months ago",
    "occupancy_lag_3": "Occupancy three months ago",
    "occupancy_rolling_3": "Recent three-month occupancy average",
    "occupancy_change_lag_1": "Recent occupancy change",
    "occupancy_change_lag_2": "Earlier occupancy change",
}


@dataclass(frozen=True)
class SelectedModelBundle:
    model: Pipeline
    metadata: dict[str, Any]
    raw_feature_names: tuple[str, ...]
    transformed_feature_names: tuple[str, ...]
    preprocessing: ColumnTransformer
    regressor: LGBMRegressor
    explainer: shap.TreeExplainer


def load_selected_model(model_path: Path, metadata_path: Path) -> SelectedModelBundle:
    """Load and validate exactly the selected saved v2 artifact; never fit it."""
    payload = joblib.load(model_path)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not isinstance(payload.get("model"), Pipeline):
        raise TypeError(
            "The v2 artifact does not contain the expected pipeline payload"
        )
    if payload.get("target_type") != "residual":
        raise ValueError("The selected artifact must predict a residual target")
    raw_names = tuple(payload.get("feature_names", ()))
    if raw_names != tuple(V2_FEATURES) or raw_names != tuple(metadata["feature_names"]):
        raise ValueError("Artifact, metadata, and selected feature order do not match")
    if metadata.get("schema_version") != 2:
        raise ValueError("Unsupported selected model schema version")
    if metadata.get("residual_target") != "occupancy_rate - occupancy_lag_1":
        raise ValueError("Selected metadata has unexpected residual semantics")
    model = payload["model"]
    if tuple(model.named_steps) != ("preprocessing", "regressor"):
        raise ValueError("Selected model pipeline schema is not recognized")
    preprocessing = model.named_steps["preprocessing"]
    regressor = model.named_steps["regressor"]
    if not isinstance(preprocessing, ColumnTransformer):
        raise TypeError("Selected model preprocessing is not a ColumnTransformer")
    if not isinstance(regressor, LGBMRegressor):
        raise TypeError("Selected model estimator is not LightGBM")
    encoder = preprocessing.named_transformers_["region"]
    if getattr(encoder, "handle_unknown", None) != "ignore":
        raise ValueError("Selected categorical encoder must ignore unknown values")
    transformed_names = tuple(preprocessing.get_feature_names_out())
    if len(transformed_names) != regressor.n_features_in_:
        raise ValueError("Preprocessing output does not align with LightGBM input")
    return SelectedModelBundle(
        model=model,
        metadata=metadata,
        raw_feature_names=raw_names,
        transformed_feature_names=transformed_names,
        preprocessing=preprocessing,
        regressor=regressor,
        explainer=shap.TreeExplainer(regressor),
    )


def _transformed_values(
    bundle: SelectedModelBundle, features: pd.DataFrame
) -> np.ndarray:
    if tuple(features.columns) != bundle.raw_feature_names:
        raise ValueError("Explanation feature order does not match the selected model")
    transformed = bundle.preprocessing.transform(features)
    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()
    values = np.asarray(transformed, dtype=float)
    if values.ndim != 2 or values.shape[1] != len(bundle.transformed_feature_names):
        raise ValueError("Transformed explanation features are not model-aligned")
    if not np.isfinite(values).all():
        raise ValueError("Transformed explanation features must be finite")
    return values


def transformed_shap_values(
    bundle: SelectedModelBundle, features: pd.DataFrame
) -> tuple[np.ndarray, float, np.ndarray]:
    transformed = _transformed_values(bundle, features)
    shap_values = np.asarray(bundle.explainer.shap_values(transformed), dtype=float)
    if shap_values.ndim == 1:
        shap_values = shap_values.reshape(1, -1)
    if shap_values.shape != transformed.shape or not np.isfinite(shap_values).all():
        raise ValueError("TreeSHAP output is not finite or model-aligned")
    base = float(np.asarray(bundle.explainer.expected_value).reshape(-1)[0])
    predictions = np.asarray(bundle.regressor.predict(transformed), dtype=float)
    reconstructed = base + shap_values.sum(axis=1)
    if not np.allclose(reconstructed, predictions, rtol=0.0, atol=ADDIVITY_TOLERANCE):
        error = float(np.max(np.abs(reconstructed - predictions)))
        raise ValueError(f"TreeSHAP additivity failed (maximum error {error:.3g})")
    return shap_values, base, transformed


def _raw_feature_for_transformed(name: str) -> str:
    if name.startswith("canonical_region_"):
        return "canonical_region"
    if name in V2_FEATURES:
        return name
    raise ValueError(f"Unknown transformed feature: {name}")


def group_shap_to_raw_features(
    bundle: SelectedModelBundle, transformed_shap: np.ndarray
) -> np.ndarray:
    grouped = np.zeros((transformed_shap.shape[0], len(bundle.raw_feature_names)))
    raw_index = {name: index for index, name in enumerate(bundle.raw_feature_names)}
    for column, transformed_name in enumerate(bundle.transformed_feature_names):
        grouped[:, raw_index[_raw_feature_for_transformed(transformed_name)]] += (
            transformed_shap[:, column]
        )
    return grouped


def _json_value(value: Any) -> str | int | float:
    if isinstance(value, (np.integer, int)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return float(value)
    return str(value)


def deterministic_explanation_text(
    predicted_residual: float, contributions: list[dict[str, Any]]
) -> str:
    trend = (
        "rise"
        if predicted_residual > 0
        else "fall"
        if predicted_residual < 0
        else "remain unchanged"
    )
    nonzero = [item for item in contributions if abs(item["shap_value"]) > 1e-9]
    if not nonzero:
        factors = "No individual feature materially shifted the residual prediction."
    else:
        labels: list[str] = []
        for item in nonzero[:2]:
            label = (
                "Seasonality"
                if item["feature"] in {"month_sin", "month_cos"}
                else item["display_name"]
            )
            if label not in labels:
                labels.append(label)
        factors = (
            f"{', '.join(labels)} contributed most to the model adjustment."
            if labels
            else "No individual feature materially shifted the residual prediction."
        )
    return (
        f"Visitor pressure is forecast to {trend} compared with the previous month. "
        f"{factors} SHAP values describe how inputs pushed the predicted residual "
        "upward or downward; they do not establish causation."
    )


def explain_row(
    bundle: SelectedModelBundle,
    row: pd.Series | dict[str, Any],
    *,
    actual_occupancy: float | None = None,
) -> dict[str, Any]:
    source = dict(row)
    features = pd.DataFrame(
        [[source[name] for name in bundle.raw_feature_names]],
        columns=bundle.raw_feature_names,
    )
    transformed_shap, base, _ = transformed_shap_values(bundle, features)
    grouped = group_shap_to_raw_features(bundle, transformed_shap)[0]
    predicted_residual = float(bundle.model.predict(features)[0])
    previous = float(source["occupancy_lag_1"])
    predicted_occupancy = previous + predicted_residual
    if not np.isclose(
        base + grouped.sum(),
        predicted_residual,
        rtol=0.0,
        atol=ADDIVITY_TOLERANCE,
    ):
        raise ValueError("Grouped SHAP values do not reconstruct predicted residual")
    contributions = [
        {
            "feature": name,
            "display_name": FEATURE_LABELS[name],
            "feature_value": _json_value(source[name]),
            "shap_value": float(value),
            "direction": "increase"
            if value > 0
            else "decrease"
            if value < 0
            else "neutral",
        }
        for name, value in zip(bundle.raw_feature_names, grouped, strict=True)
    ]
    contributions.sort(key=lambda item: (-abs(item["shap_value"]), item["feature"]))
    result: dict[str, Any] = {
        "model_version": str(bundle.metadata["model_version"]),
        "prediction_type": PREDICTION_TYPE,
        "forecast_mode": FORECAST_MODE,
        "region": str(source["canonical_region"]),
        "year": int(
            source.get(
                "year", pd.Timestamp(source["date"]).year if "date" in source else 0
            )
        ),
        "month": int(source["month"]),
        "forecast_month": f"{int(source.get('year', 0)):04d}-{int(source['month']):02d}"
        if source.get("year")
        else None,
        "previous_occupancy": previous,
        "predicted_residual": predicted_residual,
        "predicted_occupancy": predicted_occupancy,
        "base_residual": base,
        "feature_contributions": contributions,
        "top_positive_factors": [
            item for item in contributions if item["shap_value"] > 0
        ][:3],
        "top_negative_factors": [
            item for item in contributions if item["shap_value"] < 0
        ][:3],
        "explanation_text": deterministic_explanation_text(
            predicted_residual, contributions
        ),
        "model_metadata": {
            "algorithm": "LightGBM",
            "target": "residual occupancy change",
            "explained_target": "predicted_residual",
        },
    }
    if actual_occupancy is not None:
        result["actual_occupancy"] = float(actual_occupancy)
        result["absolute_error"] = abs(float(actual_occupancy) - predicted_occupancy)
    return result


def _choose_local_examples(
    explanations: list[dict[str, Any]], minimum: int = 4
) -> list[dict[str, Any]]:
    accurate = min(
        explanations,
        key=lambda item: (item["absolute_error"], item["region"], item["month"]),
    )
    large_error = max(
        explanations,
        key=lambda item: (item["absolute_error"], item["region"], item["month"]),
    )
    increasing = min(
        (
            item
            for item in explanations
            if item["predicted_residual"] > 0 and item["region"] != accurate["region"]
        ),
        key=lambda item: (-item["predicted_residual"], item["region"], item["month"]),
    )
    decreasing = min(
        (
            item
            for item in explanations
            if item["predicted_residual"] < 0
            and item["region"] not in {accurate["region"], increasing["region"]}
        ),
        key=lambda item: (item["predicted_residual"], item["region"], item["month"]),
    )
    selected = [accurate, large_error, increasing, decreasing]
    deduplicated: list[dict[str, Any]] = []
    seen: set[tuple[str, int, int]] = set()
    for item in selected + explanations:
        key = (item["region"], item["year"], item["month"])
        if key not in seen:
            seen.add(key)
            deduplicated.append(item)
        if len(deduplicated) >= minimum:
            break
    labels = (
        "relatively_accurate",
        "large_error",
        "increasing_residual",
        "decreasing_residual",
    )
    for label, item in zip(labels, deduplicated, strict=True):
        item["example_type"] = label
    return deduplicated


def generate_evaluation_outputs(
    *,
    model_path: Path,
    metadata_path: Path,
    data_path: Path,
    arrivals_path: Path,
    evaluation_dir: Path,
    explanation_metadata_path: Path,
) -> dict[str, Any]:
    """Evaluate explanations from the saved artifact without training or fitting."""
    bundle = load_selected_model(model_path, metadata_path)
    data = add_leakage_safe_v2_features(
        load_dataset(data_path), load_monthly_arrivals(arrivals_path)
    )
    held_out = common_eligible_rows(data, (2024,)).sort_values(
        ["date", "canonical_region"]
    )
    features = held_out[list(bundle.raw_feature_names)]
    transformed_shap, base, transformed = transformed_shap_values(bundle, features)
    grouped = group_shap_to_raw_features(bundle, transformed_shap)

    shap_dir = evaluation_dir / "shap"
    shap_dir.mkdir(parents=True, exist_ok=True)
    importance = pd.DataFrame(
        {
            "feature": bundle.raw_feature_names,
            "mean_abs_shap": np.abs(grouped).mean(axis=0),
        }
    ).sort_values(["mean_abs_shap", "feature"], ascending=[False, True])
    importance["rank"] = np.arange(1, len(importance) + 1)
    importance.to_csv(evaluation_dir / "shap_feature_importance.csv", index=False)

    shap.summary_plot(
        grouped,
        features=features,
        feature_names=list(bundle.raw_feature_names),
        plot_type="bar",
        show=False,
    )
    import matplotlib.pyplot as plt

    plt.tight_layout()
    plt.savefig(shap_dir / "shap_bar.png", dpi=180, bbox_inches="tight")
    plt.close()
    shap.summary_plot(
        transformed_shap,
        features=transformed,
        feature_names=list(bundle.transformed_feature_names),
        show=False,
    )
    plt.tight_layout()
    plt.savefig(shap_dir / "shap_beeswarm.png", dpi=180, bbox_inches="tight")
    plt.close()

    explanations = [
        explain_row(bundle, row, actual_occupancy=float(row["occupancy_rate"]))
        for _, row in held_out.iterrows()
    ]
    examples = _choose_local_examples(explanations)
    (evaluation_dir / "shap_local_examples.json").write_text(
        json.dumps(examples, indent=2, sort_keys=True), encoding="utf-8"
    )

    contexts = [
        {
            "forecast_month": item["forecast_month"],
            **{name: _json_value(row[name]) for name in bundle.raw_feature_names},
        }
        for item, (_, row) in zip(explanations, held_out.iterrows(), strict=True)
    ]
    explanation_metadata = {
        "schema_version": 1,
        "model_version": bundle.metadata["model_version"],
        "explained_target": "predicted_residual (occupancy_rate - occupancy_lag_1)",
        "shap_algorithm": type(bundle.explainer).__name__,
        "feature_labels": FEATURE_LABELS,
        "additivity_tolerance": ADDIVITY_TOLERANCE,
        "explanation_wording_version": EXPLANATION_WORDING_VERSION,
        "prediction_type": PREDICTION_TYPE,
        "forecast_mode": FORECAST_MODE,
        "forecast_inputs": contexts,
    }
    explanation_metadata_path.write_text(
        json.dumps(explanation_metadata, indent=2, sort_keys=True), encoding="utf-8"
    )
    predictions = np.asarray(bundle.model.predict(features), dtype=float)
    max_additivity_error = float(
        np.max(np.abs(base + transformed_shap.sum(axis=1) - predictions))
    )
    return {
        "rows": len(held_out),
        "explainer_type": type(bundle.explainer).__name__,
        "max_additivity_error": max_additivity_error,
        "top_features": importance.head(5).to_dict(orient="records"),
        "local_examples": examples,
    }
