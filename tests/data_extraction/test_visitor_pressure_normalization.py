from __future__ import annotations

from collections import Counter
from pathlib import Path

from scripts.data_extraction.build_visitor_pressure_dataset import read_csv


PROCESSED = Path(__file__).resolve().parents[2] / "data" / "processed"


def load(name: str) -> list[dict[str, str]]:
    return read_csv(PROCESSED / name)


def test_eligible_rows_have_canonical_region() -> None:
    rows = load("model_candidate_rows.csv")
    assert rows
    assert all(row["canonical_region"] for row in rows)


def test_no_duplicate_year_month_original_location() -> None:
    rows = load("visitor_pressure_raw.csv")
    keys = [(row["year"], row["month"], row["original_location"]) for row in rows]
    assert all(count == 1 for count in Counter(keys).values())


def test_no_fabricated_2021_to_2023_monthly_targets() -> None:
    rows = load("visitor_pressure_raw.csv")
    assert not [row for row in rows if row["year"] in {"2021", "2022", "2023"}]


def test_monthly_arrivals_merge_exactly() -> None:
    arrivals = {(row["year"], row["month"]): row["total_arrivals"] for row in load("monthly_arrivals.csv")}
    rows = load("visitor_pressure_raw.csv")
    assert all(row["total_arrivals"] == arrivals[(row["year"], row["month"])] for row in rows)


def test_occupancy_stays_within_reported_scale() -> None:
    assert all(0 <= float(row["occupancy_rate"]) <= 100 for row in load("visitor_pressure_raw.csv"))


def test_mapping_preserves_original_location() -> None:
    source = {
        (row["year"], row["month"], row["location"], row["location_type"])
        for row in load("occupancy_raw.csv") if row["source_granularity"] == "monthly"
    }
    normalized = {
        (row["year"], row["month"], row["original_location"], row["original_location_type"])
        for row in load("visitor_pressure_raw.csv")
    }
    assert normalized == source


def test_capacity_spelling_alias_preserves_occupancy_location() -> None:
    rows = [
        row for row in load("visitor_pressure_raw.csv")
        if row["year"] == "2024" and row["original_location"] == "Moneragala"
    ]
    assert len(rows) == 12
    assert all(row["rooms"] == "814" for row in rows)
    assert all("Moneragala → Monaragala" in row["notes"] for row in rows)


def test_manual_review_rows_are_not_silently_cleaned() -> None:
    reviews = load("source_observation_reviews.csv")
    assert all(
        row["needs_manual_review"] == "true" and row["source_conflict"] == "true"
        for row in reviews if row["year"] == "2021"
    )
    assert all(
        row["verified"] == "true" and row["review_status"] == "verified_after_visual_review"
        for row in reviews if row["year"] == "2019"
    )


def test_2020_arrival_discrepancy_is_preserved() -> None:
    reconciliation = load("arrival_reconciliation.csv")
    assert reconciliation == [{
        "year": "2020",
        "metric": "December tourist arrivals",
        "source_report": "Annual Statistical Report 2020.pdf",
        "source_table": "Table 29: Tourist Arrivals by Month – 1971 to 2020",
        "source_page": "102",
        "reported_value": "0",
        "revised_value": "393",
        "revision_source": "Year in Review 2021.pdf; Table 01; PDF page 4",
        "revision_status": "documented_not_applied_to_raw",
        "printed_annual_total": "507704",
        "sum_of_months": "507311",
        "discrepancy": "393",
        "preferred_downstream_usage": "Preserve the 2020-report monthly observation in raw data; evaluate the documented revision explicitly in later sensitivity analysis.",
        "notes": "The 2020 report prints December as 0 but an annual total of 507,704. The 2021 report later prints December 2020 as 393. No silent replacement was made.",
    }]
    december = next(row for row in load("monthly_arrivals.csv") if row["year"] == "2020" and row["month"] == "12")
    assert december["total_arrivals"] == "0"


def test_2019_rows_retain_review_metadata() -> None:
    rows = [row for row in load("visitor_pressure_raw.csv") if row["year"] == "2019"]
    assert len(rows) == 84
    assert all(row["review_status"] == "verified_after_visual_review" for row in rows)
    assert all("image-only" in row["notes"] for row in rows)


def test_pandemic_rows_are_kept_and_flagged() -> None:
    candidates = load("model_candidate_rows.csv")
    rows_2020 = [row for row in candidates if row["year"] == "2020"]
    assert len(rows_2020) == 228
    assert all(row["is_pandemic_period"] == "true" for row in rows_2020)
