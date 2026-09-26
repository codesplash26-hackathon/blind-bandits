#!/usr/bin/env python3
"""Validate canonical aggregation and leakage-safe feature engineering."""

from __future__ import annotations

import argparse
import math
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from statistics import mean

try:
    from scripts.data_extraction.build_ml_dataset import month_offset, read_csv
except ModuleNotFoundError:
    from build_ml_dataset import month_offset, read_csv


def _optional_float(value: str) -> float | None:
    return None if value == "" else float(value)


def validate(processed_dir: Path) -> list[str]:
    errors: list[str] = []
    candidates = read_csv(processed_dir / "model_candidate_rows.csv")
    canonical = read_csv(processed_dir / "canonical_region_month.csv")
    features = read_csv(processed_dir / "visitor_pressure.csv")
    arrivals = read_csv(processed_dir / "monthly_arrivals.csv")

    keys = [(row["year"], row["month"], row["canonical_region"]) for row in canonical]
    duplicates = [key for key, count in Counter(keys).items() if count > 1]
    if duplicates:
        errors.append(f"duplicate canonical targets: {duplicates[:5]}")
    if any(row["year"] in {"2021", "2022", "2023"} for row in canonical):
        errors.append("fabricated 2021–2023 monthly targets detected")
    if any(not 0 <= float(row["occupancy_rate"]) <= 100 for row in canonical):
        errors.append("canonical occupancy outside 0–100")

    direct = [row for row in candidates if row["year"] in {"2017", "2018", "2019"}]
    canonical_lookup = {(row["year"], row["month"], row["canonical_region"]): row for row in canonical}
    for source in direct:
        target = canonical_lookup.get((source["year"], source["month"], source["canonical_region"]))
        if not target or float(target["occupancy_rate"]) != float(source["occupancy_rate"]):
            errors.append(f"source resort-region value changed for {source['year']} {source['month']} {source['canonical_region']}")
            break

    district_groups: dict[tuple[str, str, str], list[dict[str, str]]] = defaultdict(list)
    for row in candidates:
        if row["original_location_type"] == "district":
            district_groups[(row["year"], row["month"], row["canonical_region"])].append(row)
    for key, rows in district_groups.items():
        weighted_rows = [(float(row["occupancy_rate"]), int(row["rooms"])) for row in rows if row["rooms"] and int(row["rooms"]) > 0]
        expected = sum(rate * rooms for rate, rooms in weighted_rows) / sum(rooms for _, rooms in weighted_rows)
        actual = float(canonical_lookup[key]["occupancy_rate"])
        if not math.isclose(actual, expected, abs_tol=1e-6):
            errors.append(f"room-weighted aggregation mismatch for {key}: {actual} vs {expected}")
            break

    feature_lookup = {(row["canonical_region"], date.fromisoformat(row["date"])): row for row in features}
    arrival_lookup = {date(int(row["year"]), int(row["month"]), 1): int(row["total_arrivals"]) for row in arrivals}
    for (region, current), row in feature_lookup.items():
        for offset, field in [(1, "occupancy_lag_1"), (2, "occupancy_lag_2"), (3, "occupancy_lag_3")]:
            prior = feature_lookup.get((region, month_offset(current, -offset)))
            expected = float(prior["occupancy_rate"]) if prior else None
            actual = _optional_float(row[field])
            if actual != expected:
                errors.append(f"calendar-continuity failure for {region} {current} {field}")
                break
        prior_values = []
        for offset in (1, 2, 3):
            prior = feature_lookup.get((region, month_offset(current, -offset)))
            prior_values.append(float(prior["occupancy_rate"]) if prior else None)
        expected_rolling = mean(prior_values) if all(value is not None for value in prior_values) else None
        actual_rolling = _optional_float(row["occupancy_rolling_3"])
        if expected_rolling is None:
            if actual_rolling is not None:
                errors.append(f"rolling_3 should be null for {region} {current}")
        elif not math.isclose(actual_rolling or 0, expected_rolling, abs_tol=1e-6):
            errors.append(f"rolling_3 mismatch for {region} {current}")
        expected_sin = math.sin(2 * math.pi * int(row["month"]) / 12)
        expected_cos = math.cos(2 * math.pi * int(row["month"]) / 12)
        if not math.isclose(float(row["month_sin"]), expected_sin, abs_tol=1e-9):
            errors.append(f"month_sin mismatch for {region} {current}")
        if not math.isclose(float(row["month_cos"]), expected_cos, abs_tol=1e-9):
            errors.append(f"month_cos mismatch for {region} {current}")
        previous_arrivals = arrival_lookup.get(month_offset(current, -1))
        expected_growth = (
            (int(row["total_arrivals"]) - previous_arrivals) / previous_arrivals
            if previous_arrivals is not None and previous_arrivals != 0 else None
        )
        actual_growth = _optional_float(row["arrivals_growth_1m"])
        if expected_growth is None:
            if actual_growth is not None:
                errors.append(f"arrival growth should be null for {current}")
        elif not math.isclose(actual_growth or 0, expected_growth, abs_tol=1e-9):
            errors.append(f"arrival growth mismatch for {current}")

    january_2024 = [row for row in features if row["year"] == "2024" and row["month"] == "1"]
    if any(row["occupancy_lag_1"] or row["occupancy_lag_2"] or row["occupancy_lag_3"] for row in january_2024):
        errors.append("January 2024 incorrectly bridges occupancy history from 2020")
    february_2024 = [row for row in features if row["year"] == "2024" and row["month"] == "2"]
    if any(row["occupancy_lag_1"] == "" for row in february_2024):
        errors.append("February 2024 is missing its January 2024 lag_1")
    if any(row["needs_manual_review"] == "true" for row in canonical):
        errors.append("canonical dataset contains manual-review target rows")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--processed-dir", type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed",
    )
    args = parser.parse_args()
    errors = validate(args.processed_dir)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        print(f"ML dataset validation failed with {len(errors)} error(s).")
        return 1
    print("ML dataset validation passed with 0 errors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
