#!/usr/bin/env python3
"""Validate geography normalization and pre-ML visitor-pressure outputs."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

try:
    from scripts.data_extraction.build_visitor_pressure_dataset import (
        CANONICAL_REGIONS,
        read_csv,
    )
except ModuleNotFoundError:  # Direct execution from the repository root.
    from build_visitor_pressure_dataset import CANONICAL_REGIONS, read_csv


def validate(processed_dir: Path) -> list[str]:
    errors: list[str] = []
    occupancy = read_csv(processed_dir / "occupancy_raw.csv")
    arrivals = read_csv(processed_dir / "monthly_arrivals.csv")
    mapping_rows = read_csv(processed_dir / "geography_mapping.csv")
    reviews = read_csv(processed_dir / "source_observation_reviews.csv")
    reconciliation = read_csv(processed_dir / "arrival_reconciliation.csv")
    visitor = read_csv(processed_dir / "visitor_pressure_raw.csv")
    candidates = read_csv(processed_dir / "model_candidate_rows.csv")

    mapping = {(row["original_location"], row["original_location_type"]): row for row in mapping_rows}
    if len(mapping) != len(mapping_rows):
        errors.append("geography_mapping.csv contains duplicate original-location keys")

    keys = [(row["year"], row["month"], row["original_location"]) for row in visitor]
    duplicates = [key for key, count in Counter(keys).items() if count > 1]
    if duplicates:
        errors.append(f"duplicate visitor year/month/original_location keys: {duplicates[:5]}")

    monthly_source = [
        row for row in occupancy
        if row["source_granularity"] == "monthly" and row["month"] and row["occupancy_rate"]
    ]
    source_keys = Counter((row["year"], row["month"], row["location"], row["location_type"]) for row in monthly_source)
    visitor_keys = Counter((row["year"], row["month"], row["original_location"], row["original_location_type"]) for row in visitor)
    if source_keys != visitor_keys:
        errors.append("visitor_pressure_raw does not preserve the genuine monthly occupancy row keys")

    forbidden = [row for row in visitor if row["year"] in {"2021", "2022", "2023"}]
    if forbidden:
        errors.append("visitor_pressure_raw contains fabricated monthly target rows for 2021–2023")

    arrival_lookup = {(row["year"], row["month"]): row["total_arrivals"] for row in arrivals}
    for row in visitor:
        expected = arrival_lookup.get((row["year"], row["month"]))
        if row["total_arrivals"] != expected:
            errors.append(f"arrival merge mismatch for {row['year']}-{row['month']}")
            break
        rate = float(row["occupancy_rate"])
        if not 0 <= rate <= 100:
            errors.append(f"occupancy outside 0–100 for {row['year']} {row['original_location']}")
            break
        map_row = mapping.get((row["original_location"], row["original_location_type"]))
        if map_row is None:
            errors.append(f"missing mapping for original location {row['original_location']!r}")
            break
        if row["canonical_region"] != map_row["canonical_region"]:
            errors.append(f"canonical mapping mismatch for original location {row['original_location']!r}")
            break

    for row in candidates:
        if row["canonical_region"] not in CANONICAL_REGIONS:
            errors.append(f"candidate has missing/invalid canonical region: {row}")
            break
        if row["needs_manual_review"] == "true":
            errors.append("candidate row is still marked for manual review")
            break
        expected_pandemic = "true" if row["year"] in {"2020", "2021"} else "false"
        if row["is_pandemic_period"] != expected_pandemic:
            errors.append(f"incorrect pandemic flag for year {row['year']}")
            break

    review_lookup = {
        (row["year"], row["original_location"], row["original_location_type"]): row
        for row in reviews
    }
    raw_manual_keys = {
        (row["year"], row["location"], row["location_type"])
        for row in monthly_source if row["needs_manual_review"] == "true"
    }
    for key in raw_manual_keys:
        review = review_lookup.get(key)
        if not review:
            errors.append(f"raw manual-review rows were normalized without a review record: {key}")
            continue
        if review["needs_manual_review"] != "false" or review["verified"] != "true":
            errors.append(f"raw manual-review rows were not explicitly verified: {key}")

    review_2019 = [row for row in reviews if row["year"] == "2019"]
    if len(review_2019) != 7 or any(row["review_status"] != "verified_after_visual_review" for row in review_2019):
        errors.append("2019 transcription review metadata is missing or incomplete")
    review_2021 = [row for row in reviews if row["year"] == "2021" and row["original_location_type"] == "district"]
    if len(review_2021) != 23 or any(row["needs_manual_review"] != "true" or row["source_conflict"] != "true" for row in review_2021):
        errors.append("2021 chart-conflict review metadata is missing or was silently cleaned")

    if len(reconciliation) != 1:
        errors.append("arrival_reconciliation.csv must contain exactly one 2020 reconciliation row")
    else:
        row = reconciliation[0]
        expected = {
            "reported_value": "0", "revised_value": "393",
            "printed_annual_total": "507704", "sum_of_months": "507311",
            "discrepancy": "393", "revision_status": "documented_not_applied_to_raw",
        }
        for field, value in expected.items():
            if row[field] != value:
                errors.append(f"2020 reconciliation {field}={row[field]!r}; expected {value!r}")

    december_2020 = next((row for row in arrivals if row["year"] == "2020" and row["month"] == "12"), None)
    if not december_2020 or december_2020["total_arrivals"] != "0":
        errors.append("raw December 2020 arrival value was silently replaced")

    greater_2019 = [row for row in visitor if row["year"] == "2019" and row["original_location"] == "Greater Colombo"]
    if len(greater_2019) != 12:
        errors.append("2019 Greater Colombo monthly rows are missing")
    else:
        october = next(row for row in greater_2019 if row["month"] == "10")
        if greater_2019[0]["rooms"] != "3052" or october["occupancy_rate"] != "54.32":
            errors.append("reviewed 2019 Greater Colombo corrections are not preserved")

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
        print(f"Normalization validation failed with {len(errors)} error(s).")
        return 1
    print("Normalization validation passed with 0 errors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
