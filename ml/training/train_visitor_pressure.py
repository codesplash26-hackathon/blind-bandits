#!/usr/bin/env python3
"""Train and evaluate leakage-safe CeylonTour visitor-pressure models."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from ml.training.visitor_pressure import run_training


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data",
        type=Path,
        default=REPOSITORY_ROOT / "data" / "processed" / "visitor_pressure.csv",
    )
    parser.add_argument(
        "--arrivals",
        type=Path,
        default=REPOSITORY_ROOT / "data" / "processed" / "monthly_arrivals.csv",
    )
    parser.add_argument(
        "--evaluation-dir", type=Path, default=REPOSITORY_ROOT / "ml" / "evaluation"
    )
    parser.add_argument(
        "--artifact-dir", type=Path, default=REPOSITORY_ROOT / "ml" / "artifacts"
    )
    parser.add_argument("--no-plots", action="store_true")
    args = parser.parse_args()
    result = run_training(
        args.data,
        args.arrivals,
        args.evaluation_dir,
        args.artifact_dir,
        create_plots=not args.no_plots,
    )
    metadata = result["metadata"]
    print(
        f"Selected {result['summary']['selected_experiment']} {result['summary']['selected_model']}"
    )
    print(f"2024 rows: {metadata['test_rows']}")
    print(f"MAE: {metadata['mae']:.4f}")
    print(f"Seasonal baseline MAE: {metadata['seasonal_baseline_mae']:.4f}")
    print(f"Beats seasonal baseline: {metadata['beats_seasonal_baseline']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
