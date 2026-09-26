"""Train a regional occupancy model from reviewed external CSV inputs."""

import argparse
from pathlib import Path

from app.ml.pressure.data import load_calendar, load_observations
from app.ml.pressure.training import train_pressure_model


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--observations", type=Path, required=True)
    parser.add_argument("--calendar", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    metadata = train_pressure_model(
        load_observations(args.observations),
        load_calendar(args.calendar),
        version=args.version,
        output_dir=args.output_dir,
    )
    print(f"Saved {metadata['model_version']} to {args.output_dir}")
    print(f"Model MAE: {metadata['metrics']['model_mae']:.3f}")
    print(f"Seasonal baseline MAE: {metadata['metrics']['seasonal_baseline_mae']:.3f}")
    print(
        "Model beats seasonal baseline: "
        f"{metadata['metrics']['model_beats_seasonal_baseline']}"
    )


if __name__ == "__main__":
    main()
