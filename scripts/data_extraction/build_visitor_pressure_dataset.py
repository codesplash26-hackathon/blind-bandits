#!/usr/bin/env python3
"""Build auditable pre-feature-engineering visitor-pressure datasets."""

from __future__ import annotations

import argparse
import csv
from collections import Counter
from pathlib import Path
from statistics import mean
from typing import Any, Iterable


CANONICAL_REGIONS = {
    "Colombo City", "Greater Colombo", "South Coast", "East Coast",
    "Hill Country", "Ancient Cities", "Northern Region",
}

VISITOR_COLUMNS = [
    "date", "year", "month", "original_location", "original_location_type",
    "canonical_region", "occupancy_rate", "rooms", "units_or_hotels",
    "total_arrivals", "annual_occupancy_rate", "source_year", "source_report",
    "source_table", "source_page", "source_granularity", "extraction_method",
    "needs_manual_review", "review_status", "notes",
]
MODEL_COLUMNS = VISITOR_COLUMNS + ["is_pandemic_period"]
REVIEW_COLUMNS = [
    "year", "original_location", "original_location_type", "source_table",
    "source_page", "value_scope", "raw_value", "review_status", "verified",
    "needs_manual_review", "source_conflict", "notes",
]
RECONCILIATION_COLUMNS = [
    "year", "metric", "source_report", "source_table", "source_page",
    "reported_value", "revised_value", "revision_source", "revision_status",
    "printed_annual_total", "sum_of_months", "discrepancy",
    "preferred_downstream_usage", "notes",
]
SUMMARY_COLUMNS = ["section", "key", "count"]
CAPACITY_LOCATION_ALIASES = {
    ("2024", "Moneragala", "district"): "Monaragala",
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, columns: list[str], rows: Iterable[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="raise")
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in columns})


def build_review_records(occupancy: list[dict[str, str]]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    rows_2019 = [row for row in occupancy if row["year"] == "2019" and row["source_granularity"] == "monthly"]
    for location in sorted({row["location"] for row in rows_2019}):
        location_rows = sorted(
            (row for row in rows_2019 if row["location"] == location),
            key=lambda row: int(row["month"]),
        )
        if len(location_rows) != 12:
            raise ValueError(f"2019 review expected 12 rows for {location}; got {len(location_rows)}")
        simple_mean = mean(float(row["occupancy_rate"]) for row in location_rows)
        annual = float(location_rows[0]["annual_occupancy_rate"])
        note = (
            "Verified cell-by-cell against rendered Table 23 on PDF page 91; source remains image-only. "
            f"The seven-region structure matches 2017–2018, and the simple monthly mean ({simple_mean:.2f}) "
            f"is within {abs(simple_mean - annual):.2f} points of the reported annual rate ({annual:.2f}); "
            "no value was changed merely for appearing unusual."
        )
        if location == "Greater Colombo":
            note += " Review corrected the prior transcription: rooms 3,059 to 3,052 and October 54.39 to 54.32."
        records.append({
            "year": 2019, "original_location": location,
            "original_location_type": "resort_region",
            "source_table": rows_2019[0]["source_table"], "source_page": 91,
            "value_scope": "monthly_occupancy_and_capacity",
            "raw_value": "12 monthly values, rooms, units, and annual rate retained in occupancy_raw.csv",
            "review_status": "verified_after_visual_review", "verified": "true",
            "needs_manual_review": "false", "source_conflict": "false", "notes": note,
        })

    rows_2021 = [row for row in occupancy if row["year"] == "2021" and row["location_type"] == "district"]
    for row in sorted(rows_2021, key=lambda item: item["location"]):
        records.append({
            "year": 2021, "original_location": row["location"],
            "original_location_type": "district", "source_table": row["source_table"],
            "source_page": row["source_page"], "value_scope": "annual_occupancy_rate",
            "raw_value": row["annual_occupancy_rate"],
            "review_status": "source_conflict_requires_review", "verified": "false",
            "needs_manual_review": "true", "source_conflict": "true",
            "notes": "Raw chart value preserved. Chart 08 labels conflict with the accompanying narrative (including the statement that Jaffna and other districts recorded zero); this annual value is not a monthly target.",
        })
    return records


def build_arrival_reconciliation(arrivals: list[dict[str, str]]) -> list[dict[str, Any]]:
    monthly_2020 = [int(row["total_arrivals"]) for row in arrivals if row["year"] == "2020"]
    if len(monthly_2020) != 12:
        raise ValueError(f"Expected 12 raw 2020 arrival rows, got {len(monthly_2020)}")
    monthly_sum = sum(monthly_2020)
    printed_total = 507_704
    return [{
        "year": 2020, "metric": "December tourist arrivals",
        "source_report": "Annual Statistical Report 2020.pdf",
        "source_table": "Table 29: Tourist Arrivals by Month – 1971 to 2020",
        "source_page": 102, "reported_value": 0, "revised_value": 393,
        "revision_source": "Year in Review 2021.pdf; Table 01; PDF page 4",
        "revision_status": "documented_not_applied_to_raw",
        "printed_annual_total": printed_total, "sum_of_months": monthly_sum,
        "discrepancy": printed_total - monthly_sum,
        "preferred_downstream_usage": "Preserve the 2020-report monthly observation in raw data; evaluate the documented revision explicitly in later sensitivity analysis.",
        "notes": "The 2020 report prints December as 0 but an annual total of 507,704. The 2021 report later prints December 2020 as 393. No silent replacement was made.",
    }]


def load_mapping(path: Path) -> dict[tuple[str, str], dict[str, str]]:
    rows = read_csv(path)
    mapping: dict[tuple[str, str], dict[str, str]] = {}
    for row in rows:
        key = (row["original_location"], row["original_location_type"])
        if key in mapping:
            raise ValueError(f"Duplicate geography mapping: {key}")
        canonical = row["canonical_region"]
        if canonical and canonical not in CANONICAL_REGIONS and canonical != "Sri Lanka":
            raise ValueError(f"Unknown canonical region {canonical!r} for {key}")
        mapping[key] = row
    return mapping


def build_visitor_rows(
    occupancy: list[dict[str, str]], arrivals: list[dict[str, str]],
    capacities: list[dict[str, str]], mapping: dict[tuple[str, str], dict[str, str]],
    reviews: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], int]:
    arrival_lookup = {(row["year"], row["month"]): row["total_arrivals"] for row in arrivals}
    capacity_lookup = {
        (row["year"], row["location"], row["location_type"]): row
        for row in capacities
    }
    review_lookup = {
        (str(row["year"]), str(row["original_location"]), str(row["original_location_type"])): row
        for row in reviews
    }
    output: list[dict[str, Any]] = []
    annual_only_excluded = 0
    for source in occupancy:
        if source["source_granularity"] != "monthly" or not source["month"] or not source["occupancy_rate"]:
            annual_only_excluded += 1
            continue
        map_key = (source["location"], source["location_type"])
        if map_key not in mapping:
            raise ValueError(f"Missing geography mapping for {map_key}")
        geography = mapping[map_key]
        review = review_lookup.get((source["year"], source["location"], source["location_type"]))
        review_status = "not_required"
        needs_review = source["needs_manual_review"]
        notes: list[str] = []
        if geography["notes"]:
            notes.append(geography["notes"])
        if review:
            review_status = str(review["review_status"])
            needs_review = str(review["needs_manual_review"])
            notes.append(str(review["notes"]))
        elif needs_review == "true":
            review_status = "needs_manual_review"
        if source["year"] == "2020":
            notes.append("Pandemic-period source observation. Monthly arrivals retain the 2020-report December value of 0; see arrival_reconciliation.csv.")

        capacity_key = (source["year"], source["location"], source["location_type"])
        capacity = capacity_lookup.get(capacity_key)
        if capacity is None and capacity_key in CAPACITY_LOCATION_ALIASES:
            capacity_location = CAPACITY_LOCATION_ALIASES[capacity_key]
            capacity = capacity_lookup.get((source["year"], capacity_location, source["location_type"]))
            if capacity:
                notes.append(
                    f"Room capacity joined through documented source-spelling alias "
                    f"{source['location']} → {capacity_location}; original occupancy location retained."
                )
        rooms = source["rooms"] or (capacity["rooms"] if capacity else "")
        units = source["units_or_hotels"] or (capacity["units_or_hotels"] if capacity else "")
        output.append({
            "date": source["date"], "year": source["year"], "month": source["month"],
            "original_location": source["location"],
            "original_location_type": source["location_type"],
            "canonical_region": geography["canonical_region"],
            "occupancy_rate": source["occupancy_rate"], "rooms": rooms,
            "units_or_hotels": units,
            "total_arrivals": arrival_lookup.get((source["year"], source["month"]), ""),
            "annual_occupancy_rate": source["annual_occupancy_rate"],
            "source_year": source["source_year"], "source_report": source["source_report"],
            "source_table": source["source_table"], "source_page": source["source_page"],
            "source_granularity": source["source_granularity"],
            "extraction_method": source["extraction_method"],
            "needs_manual_review": needs_review, "review_status": review_status,
            "notes": " ".join(notes),
        })
    return output, annual_only_excluded


def build_model_candidates(visitor_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rejected_statuses = {"needs_manual_review", "source_conflict_requires_review", "rejected"}
    output = []
    for row in visitor_rows:
        try:
            month = int(row["month"])
            occupancy = float(row["occupancy_rate"])
        except (TypeError, ValueError):
            continue
        if not 1 <= month <= 12 or not 0 <= occupancy <= 100:
            continue
        if not row["canonical_region"]:
            continue
        if row["needs_manual_review"] == "true" or row["review_status"] in rejected_statuses:
            continue
        candidate = dict(row)
        candidate["is_pandemic_period"] = "true" if int(row["year"]) in {2020, 2021} else "false"
        output.append(candidate)
    return output


def build_summary(
    visitor_rows: list[dict[str, Any]], candidates: list[dict[str, Any]],
    annual_only_excluded: int, mapping: dict[tuple[str, str], dict[str, str]],
    reviews: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for year, count in sorted(Counter(row["year"] for row in candidates).items()):
        rows.append({"section": "candidate_rows_by_year", "key": year, "count": count})
    for region, count in sorted(Counter(row["canonical_region"] for row in candidates).items()):
        rows.append({"section": "candidate_rows_by_canonical_region", "key": region, "count": count})
    metrics = {
        "visitor_pressure_raw_rows": len(visitor_rows),
        "model_candidate_rows": len(candidates),
        "unresolved_mapping_config_entries": sum(not row["canonical_region"] for row in mapping.values()),
        "visitor_rows_with_unresolved_geography": sum(not row["canonical_region"] for row in visitor_rows),
        "rows_excluded_due_to_missing_monthly_target": annual_only_excluded,
        "rows_excluded_due_to_unresolved_geography": sum(not row["canonical_region"] for row in visitor_rows),
        "rows_still_requiring_manual_review": sum(str(row["needs_manual_review"]) == "true" for row in reviews),
        "visitor_rows_requiring_manual_review": sum(row["needs_manual_review"] == "true" for row in visitor_rows),
        "pandemic_period_visitor_rows": sum(row["year"] in {"2020", "2021"} for row in visitor_rows),
        "pandemic_period_candidate_rows": sum(row["is_pandemic_period"] == "true" for row in candidates),
    }
    rows.extend({"section": "metrics", "key": key, "count": value} for key, value in metrics.items())
    return rows


def generate(processed_dir: Path) -> dict[str, Any]:
    occupancy = read_csv(processed_dir / "occupancy_raw.csv")
    arrivals = read_csv(processed_dir / "monthly_arrivals.csv")
    capacities = read_csv(processed_dir / "room_capacity.csv")
    mapping = load_mapping(processed_dir / "geography_mapping.csv")
    reviews = build_review_records(occupancy)
    reconciliation = build_arrival_reconciliation(arrivals)
    visitor_rows, annual_only_excluded = build_visitor_rows(
        occupancy, arrivals, capacities, mapping, reviews,
    )
    candidates = build_model_candidates(visitor_rows)
    summary = build_summary(visitor_rows, candidates, annual_only_excluded, mapping, reviews)

    write_csv(processed_dir / "source_observation_reviews.csv", REVIEW_COLUMNS, reviews)
    write_csv(processed_dir / "arrival_reconciliation.csv", RECONCILIATION_COLUMNS, reconciliation)
    write_csv(processed_dir / "visitor_pressure_raw.csv", VISITOR_COLUMNS, visitor_rows)
    write_csv(processed_dir / "model_candidate_rows.csv", MODEL_COLUMNS, candidates)
    write_csv(processed_dir / "normalization_summary.csv", SUMMARY_COLUMNS, summary)
    return {
        "visitor_rows": visitor_rows, "candidates": candidates, "summary": summary,
        "reviews": reviews, "mapping": mapping,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--processed-dir", type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "processed",
    )
    args = parser.parse_args()
    result = generate(args.processed_dir)
    print(f"Wrote {len(result['visitor_rows'])} visitor_pressure_raw rows")
    print(f"Wrote {len(result['candidates'])} model candidate rows")
    for row in result["summary"]:
        print(f"{row['section']}: {row['key']}={row['count']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
