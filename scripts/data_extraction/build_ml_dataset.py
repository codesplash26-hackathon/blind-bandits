#!/usr/bin/env python3
"""Build canonical region-month targets and leakage-safe ML features."""

from __future__ import annotations

import argparse
import csv
import math
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from statistics import mean
from typing import Any, Iterable


CANONICAL_COLUMNS = [
    "date", "year", "month", "canonical_region", "occupancy_rate",
    "total_arrivals", "room_capacity", "source_granularity",
    "aggregation_method", "source_district_count", "is_pandemic_period",
    "source_years", "needs_manual_review",
]
AUDIT_COLUMNS = [
    "year", "month", "canonical_region", "source_districts", "district_count",
    "rooms_used", "aggregation_method", "occupancy_result",
    "excluded_districts", "warnings",
]
FEATURE_COLUMNS = CANONICAL_COLUMNS + [
    "month_sin", "month_cos", "arrivals_lag_1", "arrivals_growth_1m",
    "arrivals_rolling_3", "occupancy_lag_1", "occupancy_lag_2",
    "occupancy_lag_3", "occupancy_rolling_3", "target_available",
    "lag_1_available", "lag_2_available", "lag_3_available",
    "rolling_3_available", "arrivals_lag_1_available",
    "arrivals_growth_1m_available", "arrivals_rolling_3_available",
]
SPLIT_COLUMNS = [
    "experiment", "role", "years", "feature_requirement", "row_count", "notes",
]
SUMMARY_COLUMNS = ["section", "metric", "key", "value", "notes"]


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, columns: list[str], rows: Iterable[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="raise")
        writer.writeheader()
        for row in rows:
            writer.writerow({column: _csv_value(row.get(column, "")) for column in columns})


def _csv_value(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    return value


def month_offset(value: date, offset: int) -> date:
    month_index = value.year * 12 + value.month - 1 + offset
    return date(month_index // 12, month_index % 12 + 1, 1)


def _date(row: dict[str, Any]) -> date:
    return date.fromisoformat(str(row["date"]))


def _unresolved_by_year(visitor_rows: list[dict[str, str]]) -> dict[int, list[str]]:
    result: dict[int, set[str]] = defaultdict(set)
    for row in visitor_rows:
        if row["original_location_type"] == "district" and not row["canonical_region"]:
            result[int(row["year"])].add(row["original_location"])
    return {year: sorted(locations) for year, locations in result.items()}


def build_canonical_region_month(
    candidates: list[dict[str, str]], visitor_rows: list[dict[str, str]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    canonical: list[dict[str, Any]] = []
    audit: list[dict[str, Any]] = []
    unresolved = _unresolved_by_year(visitor_rows)

    direct = [row for row in candidates if row["original_location_type"] == "resort_region"]
    for row in direct:
        canonical.append({
            "date": row["date"], "year": int(row["year"]), "month": int(row["month"]),
            "canonical_region": row["canonical_region"],
            "occupancy_rate": float(row["occupancy_rate"]),
            "total_arrivals": int(row["total_arrivals"]),
            "room_capacity": int(row["rooms"]) if row["rooms"] else None,
            "source_granularity": "resort_region",
            "aggregation_method": "source_resort_region",
            "source_district_count": 0,
            "is_pandemic_period": row["is_pandemic_period"] == "true",
            "source_years": row["source_year"],
            "needs_manual_review": row["needs_manual_review"] == "true",
        })

    district_rows = [row for row in candidates if row["original_location_type"] == "district"]
    groups: dict[tuple[int, int, str], list[dict[str, str]]] = defaultdict(list)
    for row in district_rows:
        groups[(int(row["year"]), int(row["month"]), row["canonical_region"])].append(row)

    for (year, month, region), rows in sorted(groups.items()):
        arrivals = {int(row["total_arrivals"]) for row in rows}
        if len(arrivals) != 1:
            raise ValueError(f"Inconsistent national arrivals for {year}-{month:02d} {region}")
        included: list[tuple[dict[str, str], int]] = []
        excluded: list[str] = []
        missing_capacity = False
        for row in sorted(rows, key=lambda item: item["original_location"]):
            if not row["rooms"]:
                excluded.append(f"{row['original_location']} (missing rooms)")
                missing_capacity = True
                continue
            rooms = int(row["rooms"])
            if rooms <= 0:
                excluded.append(f"{row['original_location']} ({rooms} rooms)")
                continue
            included.append((row, rooms))
        if not included:
            raise ValueError(f"No positive room capacity for {year}-{month:02d} {region}")

        rooms_used = sum(rooms for _, rooms in included)
        weighted = sum(float(row["occupancy_rate"]) * rooms for row, rooms in included) / rooms_used
        result = round(weighted, 6)
        warnings: list[str] = []
        if year == 2024:
            warnings.append(
                "2024 weights use same-year Table 09 total registered accommodation rooms because Table 19 reports hotels but not rooms; the source populations are not identical."
            )
        if excluded:
            warnings.append("Districts with missing or zero room capacity did not receive an equal-weight substitute.")
        needs_review = missing_capacity

        canonical.append({
            "date": f"{year:04d}-{month:02d}-01", "year": year, "month": month,
            "canonical_region": region, "occupancy_rate": result,
            "total_arrivals": arrivals.pop(), "room_capacity": rooms_used,
            "source_granularity": "district",
            "aggregation_method": "room_weighted_district_occupancy",
            "source_district_count": len(included),
            "is_pandemic_period": year in {2020, 2021}, "source_years": str(year),
            "needs_manual_review": needs_review,
        })
        audit.append({
            "year": year, "month": month, "canonical_region": region,
            "source_districts": "; ".join(row["original_location"] for row, _ in included),
            "district_count": len(included), "rooms_used": rooms_used,
            "aggregation_method": "room_weighted_district_occupancy",
            "occupancy_result": result, "excluded_districts": "; ".join(excluded),
            "warnings": " ".join(warnings),
        })

    for year in sorted(unresolved):
        for month in range(1, 13):
            audit.append({
                "year": year, "month": month, "canonical_region": "",
                "source_districts": "", "district_count": 0, "rooms_used": "",
                "aggregation_method": "excluded_unresolved_geography",
                "occupancy_result": "",
                "excluded_districts": "; ".join(unresolved[year]),
                "warnings": "District observations preserved in visitor_pressure_raw.csv but excluded from canonical aggregation because geography is unresolved.",
            })

    canonical.sort(key=lambda row: (_date(row), row["canonical_region"]))
    audit.sort(key=lambda row: (int(row["year"]), int(row["month"]), row["canonical_region"]))
    return canonical, audit


def _exact_history(
    lookup: dict[tuple[str, date], float], region: str, current: date, offset: int,
) -> float | None:
    return lookup.get((region, month_offset(current, -offset)))


def build_features(
    canonical: list[dict[str, Any]], monthly_arrivals: list[dict[str, str]],
) -> list[dict[str, Any]]:
    occupancy_lookup = {
        (row["canonical_region"], _date(row)): float(row["occupancy_rate"])
        for row in canonical
    }
    arrival_lookup = {
        date(int(row["year"]), int(row["month"]), 1): int(row["total_arrivals"])
        for row in monthly_arrivals
    }
    output: list[dict[str, Any]] = []
    for row in canonical:
        current = _date(row)
        region = row["canonical_region"]
        occupancy_lags = [_exact_history(occupancy_lookup, region, current, offset) for offset in (1, 2, 3)]
        rolling_occupancy = mean(occupancy_lags) if all(value is not None for value in occupancy_lags) else None

        prior_arrivals = arrival_lookup.get(month_offset(current, -1))
        prior_three_arrivals = [arrival_lookup.get(month_offset(current, -offset)) for offset in (1, 2, 3)]
        current_arrivals = int(row["total_arrivals"])
        arrival_growth = (
            (current_arrivals - prior_arrivals) / prior_arrivals
            if prior_arrivals is not None and prior_arrivals != 0 else None
        )
        arrival_rolling = (
            mean(prior_three_arrivals)
            if all(value is not None for value in prior_three_arrivals) else None
        )

        feature_row = dict(row)
        feature_row.update({
            "month_sin": round(math.sin(2 * math.pi * int(row["month"]) / 12), 10),
            "month_cos": round(math.cos(2 * math.pi * int(row["month"]) / 12), 10),
            "arrivals_lag_1": prior_arrivals,
            "arrivals_growth_1m": round(arrival_growth, 10) if arrival_growth is not None else None,
            "arrivals_rolling_3": round(arrival_rolling, 6) if arrival_rolling is not None else None,
            "occupancy_lag_1": occupancy_lags[0],
            "occupancy_lag_2": occupancy_lags[1],
            "occupancy_lag_3": occupancy_lags[2],
            "occupancy_rolling_3": round(rolling_occupancy, 6) if rolling_occupancy is not None else None,
            "target_available": row["occupancy_rate"] is not None,
            "lag_1_available": occupancy_lags[0] is not None,
            "lag_2_available": occupancy_lags[1] is not None,
            "lag_3_available": occupancy_lags[2] is not None,
            "rolling_3_available": rolling_occupancy is not None,
            "arrivals_lag_1_available": prior_arrivals is not None,
            "arrivals_growth_1m_available": arrival_growth is not None,
            "arrivals_rolling_3_available": arrival_rolling is not None,
        })
        output.append(feature_row)
    return output


def build_split_summary(features: list[dict[str, Any]]) -> list[dict[str, Any]]:
    experiments = {
        "A": {
            "train": ({2017, 2018, 2019}, "Train on pre-pandemic years."),
            "validation": ({2020}, "Optional pandemic validation period."),
            "test": ({2024}, "Final held-out period after the 2021–2023 target gap."),
        },
        "B": {
            "train": ({2017, 2018, 2019, 2020}, "Train includes pandemic observations."),
            "test": ({2024}, "Final held-out period after the 2021–2023 target gap."),
        },
        "C": {
            "train": ({2017, 2018, 2019}, "Pandemic year excluded."),
            "test": ({2024}, "Final held-out period after the 2021–2023 target gap."),
        },
    }
    requirements = {
        "A_no_occupancy_lags": lambda row: True,
        "B_lag_1": lambda row: bool(row["lag_1_available"]),
        "C_lag_1_lag_2_lag_3": lambda row: all(bool(row[key]) for key in ("lag_1_available", "lag_2_available", "lag_3_available")),
        "D_rolling_3": lambda row: bool(row["rolling_3_available"]),
    }
    rows: list[dict[str, Any]] = []
    for experiment, roles in experiments.items():
        for role, (years, note) in roles.items():
            role_rows = [row for row in features if int(row["year"]) in years]
            for requirement, predicate in requirements.items():
                rows.append({
                    "experiment": experiment, "role": role,
                    "years": ";".join(str(year) for year in sorted(years)),
                    "feature_requirement": requirement,
                    "row_count": sum(predicate(row) for row in role_rows),
                    "notes": note + " Occupancy lags require exact calendar-month continuity; 2024 never links back to 2020.",
                })
    return rows


def build_ml_summary(
    canonical: list[dict[str, Any]], features: list[dict[str, Any]],
    audit: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    def add(section: str, metric: str, key: str, value: Any, notes: str = "") -> None:
        rows.append({"section": section, "metric": metric, "key": key, "value": value, "notes": notes})

    add("overview", "total_canonical_region_month_rows", "all", len(canonical))
    for year, count in sorted(Counter(int(row["year"]) for row in canonical).items()):
        add("rows_by_year", "row_count", str(year), count)
    for region, count in sorted(Counter(row["canonical_region"] for row in canonical).items()):
        add("rows_by_region", "row_count", region, count)

    occupancy = [float(row["occupancy_rate"]) for row in canonical]
    add("occupancy", "mean", "all", round(mean(occupancy), 6))
    add("occupancy", "min", "all", min(occupancy))
    add("occupancy", "max", "all", max(occupancy))

    feature_fields = [
        "arrivals_lag_1", "arrivals_growth_1m", "arrivals_rolling_3",
        "occupancy_lag_1", "occupancy_lag_2", "occupancy_lag_3",
        "occupancy_rolling_3",
    ]
    for field in feature_fields:
        missing = sum(row[field] is None for row in features)
        add("missing_values", "missing_count", field, missing)
        add("feature_availability", "available_count", field, len(features) - missing)

    add("periods", "pandemic_row_count", "2020", sum(bool(row["is_pandemic_period"]) for row in features))
    add("periods", "test_year_candidate_count", "2024", sum(int(row["year"]) == 2024 for row in features))
    warning_rows = sum(bool(row["warnings"]) for row in audit)
    add("aggregation", "audit_rows_with_warnings", "all", warning_rows,
        "Includes methodology notes, zero-room exclusions, and unresolved-geography audit rows.")
    add("aggregation", "manual_review_rows", "all", sum(bool(row["needs_manual_review"]) for row in canonical))
    return rows


def generate(processed_dir: Path) -> dict[str, Any]:
    candidates = read_csv(processed_dir / "model_candidate_rows.csv")
    visitor_rows = read_csv(processed_dir / "visitor_pressure_raw.csv")
    monthly_arrivals = read_csv(processed_dir / "monthly_arrivals.csv")
    canonical, audit = build_canonical_region_month(candidates, visitor_rows)
    features = build_features(canonical, monthly_arrivals)
    split_summary = build_split_summary(features)
    ml_summary = build_ml_summary(canonical, features, audit)

    write_csv(processed_dir / "canonical_region_month.csv", CANONICAL_COLUMNS, canonical)
    write_csv(processed_dir / "region_aggregation_audit.csv", AUDIT_COLUMNS, audit)
    write_csv(processed_dir / "visitor_pressure.csv", FEATURE_COLUMNS, features)
    write_csv(processed_dir / "evaluation_split_summary.csv", SPLIT_COLUMNS, split_summary)
    write_csv(processed_dir / "ml_dataset_summary.csv", SUMMARY_COLUMNS, ml_summary)
    return {
        "canonical": canonical, "audit": audit, "features": features,
        "split_summary": split_summary, "ml_summary": ml_summary,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--processed-dir", type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed",
    )
    args = parser.parse_args()
    result = generate(args.processed_dir)
    print(f"Wrote {len(result['canonical'])} canonical region-month rows")
    print(f"Wrote {len(result['features'])} feature-engineered rows")
    print(f"Wrote {len(result['audit'])} aggregation-audit rows")
    print(f"Wrote {len(result['split_summary'])} evaluation-split rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
