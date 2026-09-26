"""Generate SHAP evaluation artifacts from the already-fitted v2 model."""

from pathlib import Path

from ml.explanations.visitor_pressure_shap import generate_evaluation_outputs

ROOT = Path(__file__).resolve().parents[2]


if __name__ == "__main__":
    result = generate_evaluation_outputs(
        model_path=ROOT / "ml/artifacts/visitor_pressure_model_v2.joblib",
        metadata_path=ROOT / "ml/artifacts/model_metadata_v2.json",
        data_path=ROOT / "data/processed/visitor_pressure.csv",
        arrivals_path=ROOT / "data/processed/monthly_arrivals.csv",
        evaluation_dir=ROOT / "ml/evaluation",
        explanation_metadata_path=ROOT / "ml/artifacts/explanation_metadata_v2.json",
    )
    print(result)
