#!/usr/bin/env python3
"""Run focused residual and simple-model visitor-pressure experiments."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from ml.training.visitor_pressure_v2 import run_v2_experiments


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
    result = run_v2_experiments(
        args.data,
        args.arrivals,
        args.evaluation_dir,
        args.artifact_dir,
        create_plots=not args.no_plots,
    )
    summary = result["summary"]
    print(f"Common 2024 rows: {summary['common_test_rows']}")
    print(f"Persistence MAE: {summary['persistence_mae']:.4f}")
    print(
        f"Best non-baseline: {summary['best_non_baseline_model']} "
        f"(MAE {summary['best_non_baseline_mae']:.4f})"
    )
    print(f"Selected: {summary['selected_model']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
