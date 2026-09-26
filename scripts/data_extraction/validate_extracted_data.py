#!/usr/bin/env python3
"""Validate the generated SLTDA extraction CSV files."""

from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean
from typing import Any


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def _optional_float(value: str) -> float | None:
    return None if value == "" else float(value)


def _optional_int(value: str) -> int | None:
    return None if value == "" else int(value)


def duplicate_keys(rows: list[dict[str, str]]) -> list[tuple[str, str, str, str]]:
    keys = [(row["year"], row["month"], row["location"], row["location_type"]) for row in rows]
    counts = Counter(keys)
    return [key for key, count in counts.items() if count > 1]


def validate_rows(
    occupancy: list[dict[str, str]], arrivals: list[dict[str, str]],
    rooms: list[dict[str, str]],
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    allowed_location_types = {"resort_region", "district", "national"}

    for index, row in enumerate(occupancy, 2):
        month = _optional_int(row["month"])
        rate = _optional_float(row["occupancy_rate"])
        annual = _optional_float(row["annual_occupancy_rate"])
        room_count = _optional_int(row["rooms"])
        if month is not None and not 1 <= month <= 12:
            errors.append(f"occupancy row {index}: month {month} outside 1..12")
        if rate is not None and not 0 <= rate <= 100:
            errors.append(f"occupancy row {index}: occupancy_rate {rate} outside 0..100")
        if annual is not None and not 0 <= annual <= 100:
            errors.append(f"occupancy row {index}: annual_occupancy_rate {annual} outside 0..100")
        if room_count is not None and room_count < 0:
            errors.append(f"occupancy row {index}: negative rooms")
        if row["location_type"] not in allowed_location_types:
            errors.append(f"occupancy row {index}: invalid location_type {row['location_type']!r}")
        if month is None and (row["date"] or rate is not None):
            errors.append(f"occupancy row {index}: annual row contains a date or monthly rate")

    duplicates = duplicate_keys(occupancy)
    if duplicates:
        errors.append(f"duplicate occupancy primary keys: {duplicates[:5]}")

    grouped: dict[tuple[str, str, str], list[dict[str, str]]] = defaultdict(list)
    for row in occupancy:
        if row["source_granularity"] == "monthly":
            grouped[(row["year"], row["location"], row["location_type"])].append(row)
    for key, group in grouped.items():
        months = sorted(int(row["month"]) for row in group)
        if months != list(range(1, 13)):
            errors.append(f"monthly occupancy group {key} does not contain Jan–Dec exactly once")
        rates = [_optional_float(row["occupancy_rate"]) for row in group]
        annual = _optional_float(group[0]["annual_occupancy_rate"])
        if annual is not None and all(value is not None for value in rates):
            difference = abs(mean(value for value in rates if value is not None) - annual)
            if difference > 2.0:
                warnings.append(f"{key}: simple monthly mean differs from reported annual rate by {difference:.2f}; source values preserved")

    arrival_keys = Counter((row["year"], row["month"]) for row in arrivals)
    if any(count > 1 for count in arrival_keys.values()):
        errors.append("duplicate monthly-arrival year/month rows")
    for index, row in enumerate(arrivals, 2):
        month = int(row["month"])
        total = int(row["total_arrivals"])
        if not 1 <= month <= 12:
            errors.append(f"arrival row {index}: month outside 1..12")
        if total < 0:
            errors.append(f"arrival row {index}: negative total_arrivals")
    for year in range(2017, 2025):
        count = sum(int(row["year"]) == year for row in arrivals)
        if count != 12:
            errors.append(f"arrival year {year}: expected 12 rows, got {count}")

    room_keys = Counter((row["year"], row["location"], row["location_type"]) for row in rooms)
    if any(count > 1 for count in room_keys.values()):
        errors.append("duplicate room-capacity year/location/location_type rows")
    for index, row in enumerate(rooms, 2):
        if int(row["rooms"]) < 0:
            errors.append(f"room-capacity row {index}: negative rooms")
    expected_room_totals = {2020: 42_750, 2021: 47_337, 2022: 48_120, 2023: 53_229, 2024: 55_455}
    for year, expected in expected_room_totals.items():
        actual = sum(int(row["rooms"]) for row in rooms if int(row["year"]) == year)
        if actual != expected:
            errors.append(f"room-capacity year {year}: district rooms sum to {actual}, report total is {expected}")

    return errors, warnings


def assert_sanity_checks(occupancy: list[dict[str, str]]) -> list[str]:
    errors: list[str] = []
    checks: dict[tuple[int, str], dict[str, Any]] = {
        (2018, "Hill Country"): {
            "rooms": 1489, "annual": 71.67,
            "months": [72.06, 71.11, 73.53, 64.17, 66.03, 63.33, 74.68, 77.04, 77.14, 69.16, 75.11, 76.64],
        },
        (2020, "Badulla"): {
            "rooms": 286, "annual": 17.2,
            "months": [64.5, 54.4, 26.1, 2.4, 2.7, 8.1, 11.2, 9.7, 8.8, 9.0, 5.1, 9.9],
        },
        (2024, "Badulla"): {
            "rooms": None, "annual": 44.6,
            "months": [49.4, 54.2, 57.2, 53.6, 29.5, 27.2, 45.0, 57.9, 44.3, 35.4, 47.1, 34.8],
        },
    }
    for (year, location), expected in checks.items():
        rows = sorted(
            (row for row in occupancy if int(row["year"]) == year and row["location"] == location and row["month"]),
            key=lambda row: int(row["month"]),
        )
        if len(rows) != 12:
            errors.append(f"sanity check {year} {location}: expected 12 rows, got {len(rows)}")
            continue
        actual_months = [float(row["occupancy_rate"]) for row in rows]
        if actual_months != expected["months"]:
            errors.append(f"sanity check {year} {location}: monthly values differ")
        if float(rows[0]["annual_occupancy_rate"]) != expected["annual"]:
            errors.append(f"sanity check {year} {location}: annual value differs")
        actual_rooms = _optional_int(rows[0]["rooms"])
        if actual_rooms != expected["rooms"]:
            errors.append(f"sanity check {year} {location}: room count differs")
    return errors


def validate_directory(processed_dir: Path) -> tuple[list[str], list[str]]:
    occupancy = read_csv(processed_dir / "occupancy_raw.csv")
    arrivals = read_csv(processed_dir / "monthly_arrivals.csv")
    rooms = read_csv(processed_dir / "room_capacity.csv")
    errors, warnings = validate_rows(occupancy, arrivals, rooms)
    errors.extend(assert_sanity_checks(occupancy))
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--processed-dir", type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed",
    )
    args = parser.parse_args()
    errors, warnings = validate_directory(args.processed_dir)
    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        print(f"Validation failed with {len(errors)} error(s) and {len(warnings)} warning(s).")
        return 1
    print(f"Validation passed with 0 errors and {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
