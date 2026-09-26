from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest

from ml.explanations.visitor_pressure_shap import (
    ADDIVITY_TOLERANCE,
    FEATURE_LABELS,
    explain_row,
    group_shap_to_raw_features,
    load_selected_model,
    transformed_shap_values,
)
from ml.training.visitor_pressure import load_dataset, load_monthly_arrivals
from ml.training.visitor_pressure_v2 import (
    V2_FEATURES,
    add_leakage_safe_v2_features,
    common_eligible_rows,
)

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = ROOT / "ml" / "artifacts"


@pytest.fixture(scope="module")
def bundle():
    return load_selected_model(
        ARTIFACTS / "visitor_pressure_model_v2.joblib",
        ARTIFACTS / "model_metadata_v2.json",
    )


@pytest.fixture(scope="module")
def held_out() -> pd.DataFrame:
    data = add_leakage_safe_v2_features(
        load_dataset(ROOT / "data/processed/visitor_pressure.csv"),
        load_monthly_arrivals(ROOT / "data/processed/monthly_arrivals.csv"),
    )
    return common_eligible_rows(data, (2024,)).sort_values(["date", "canonical_region"])


def test_selected_artifact_schema_and_categorical_encoding(bundle) -> None:
    assert bundle.metadata["model_version"] == (
        "v2_20260926T104528Z_residual_lightgbm_r2"
    )
    assert bundle.raw_feature_names == V2_FEATURES
    assert bundle.metadata["training_years"] == [2017, 2018, 2019, 2020]
    assert bundle.metadata["test_year"] == 2024
    assert bundle.metadata["test_rows"] == 54
    encoder = bundle.preprocessing.named_transformers_["region"]
    assert encoder.handle_unknown == "ignore"
    assert len(encoder.categories_[0]) == 7
    assert bundle.regressor.n_features_in_ == len(bundle.transformed_feature_names)


def test_shap_values_are_finite_aligned_and_additive(bundle, held_out) -> None:
    features = held_out[list(V2_FEATURES)]
    values, base, _ = transformed_shap_values(bundle, features)
    grouped = group_shap_to_raw_features(bundle, values)
    residuals = bundle.model.predict(features)
    assert values.shape == (54, bundle.regressor.n_features_in_)
    assert grouped.shape == (54, len(V2_FEATURES))
    assert np.isfinite(values).all()
    assert np.isfinite(grouped).all()
    assert np.allclose(
        base + values.sum(axis=1),
        residuals,
        rtol=0.0,
        atol=ADDIVITY_TOLERANCE,
    )
    assert np.allclose(
        base + grouped.sum(axis=1),
        residuals,
        rtol=0.0,
        atol=ADDIVITY_TOLERANCE,
    )


def test_local_explanation_reconstructs_residual_and_occupancy(
    bundle, held_out
) -> None:
    result = explain_row(bundle, held_out.iloc[0])
    assert result["base_residual"] + sum(
        item["shap_value"] for item in result["feature_contributions"]
    ) == pytest.approx(result["predicted_residual"], abs=ADDIVITY_TOLERANCE)
    assert result["previous_occupancy"] + result["predicted_residual"] == (
        pytest.approx(result["predicted_occupancy"], abs=ADDIVITY_TOLERANCE)
    )
    assert [item["feature"] for item in result["feature_contributions"]] == [
        item["feature"]
        for item in sorted(
            result["feature_contributions"],
            key=lambda item: (-abs(item["shap_value"]), item["feature"]),
        )
    ]


def test_directions_and_positive_negative_residual_cases(bundle, held_out) -> None:
    results = [explain_row(bundle, row) for _, row in held_out.iterrows()]
    increasing = next(item for item in results if item["predicted_residual"] > 0)
    decreasing = next(item for item in results if item["predicted_residual"] < 0)
    assert increasing["predicted_occupancy"] > increasing["previous_occupancy"]
    assert decreasing["predicted_occupancy"] < decreasing["previous_occupancy"]
    for result in (increasing, decreasing):
        for item in result["feature_contributions"]:
            expected = (
                "increase"
                if item["shap_value"] > 0
                else "decrease"
                if item["shap_value"] < 0
                else "neutral"
            )
            assert item["direction"] == expected


def test_explanation_is_deterministic_and_survives_reload(bundle, held_out) -> None:
    row = held_out.iloc[10]
    first = explain_row(bundle, row)
    reloaded = load_selected_model(
        ARTIFACTS / "visitor_pressure_model_v2.joblib",
        ARTIFACTS / "model_metadata_v2.json",
    )
    second = explain_row(reloaded, row)
    assert first == second
    assert "caused" not in first["explanation_text"]
    assert "definitely" not in first["explanation_text"]


def test_saved_explanation_outputs_are_complete_and_consistent() -> None:
    metadata = json.loads(
        (ARTIFACTS / "explanation_metadata_v2.json").read_text(encoding="utf-8")
    )
    examples = json.loads(
        (ROOT / "ml/evaluation/shap_local_examples.json").read_text(encoding="utf-8")
    )
    importance = pd.read_csv(ROOT / "ml/evaluation/shap_feature_importance.csv")
    assert metadata["explained_target"].startswith("predicted_residual")
    assert metadata["additivity_tolerance"] == ADDIVITY_TOLERANCE
    assert metadata["feature_labels"] == FEATURE_LABELS
    assert len(metadata["forecast_inputs"]) == 54
    assert set(importance.columns) == {"feature", "mean_abs_shap", "rank"}
    assert importance["rank"].tolist() == list(range(1, len(V2_FEATURES) + 1))
    assert {item["example_type"] for item in examples} == {
        "relatively_accurate",
        "large_error",
        "increasing_residual",
        "decreasing_residual",
    }
    assert len({item["region"] for item in examples}) >= 3
    assert all(
        "actual_occupancy" in item and "absolute_error" in item for item in examples
    )
    assert (ROOT / "ml/evaluation/shap/shap_bar.png").is_file()
    assert (ROOT / "ml/evaluation/shap/shap_beeswarm.png").is_file()


def test_artifact_reload_prediction_matches_direct_saved_pipeline(
    bundle, held_out
) -> None:
    payload = joblib.load(ARTIFACTS / "visitor_pressure_model_v2.joblib")
    features = held_out[list(V2_FEATURES)].iloc[[0]]
    assert bundle.model.predict(features) == pytest.approx(
        payload["model"].predict(features)
    )
