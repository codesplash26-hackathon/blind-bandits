from __future__ import annotations

import math
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from statistics import mean

from scripts.data_extraction.build_ml_dataset import month_offset, read_csv


PROCESSED = Path(__file__).resolve().parents[2] / "data" / "processed"


def load(name: str) -> list[dict[str, str]]:
    return read_csv(PROCESSED / name)


def feature_lookup() -> dict[tuple[str, str], dict[str, str]]:
    return {(row["canonical_region"], row["date"]): row for row in load("visitor_pressure.csv")}


def test_unique_region_month_target() -> None:
    rows = load("canonical_region_month.csv")
    keys = [(row["year"], row["month"], row["canonical_region"]) for row in rows]
    assert all(count == 1 for count in Counter(keys).values())


def test_room_weighted_aggregation_correctness() -> None:
    candidates = load("model_candidate_rows.csv")
    canonical = {
        (row["year"], row["month"], row["canonical_region"]): row
        for row in load("canonical_region_month.csv")
    }
    groups: dict[tuple[str, str, str], list[dict[str, str]]] = defaultdict(list)
    for row in candidates:
        if row["original_location_type"] == "district":
            groups[(row["year"], row["month"], row["canonical_region"])].append(row)
    for key, rows in groups.items():
        weighted = [(float(row["occupancy_rate"]), int(row["rooms"])) for row in rows if row["rooms"] and int(row["rooms"]) > 0]
        expected = sum(rate * rooms for rate, rooms in weighted) / sum(rooms for _, rooms in weighted)
        assert math.isclose(float(canonical[key]["occupancy_rate"]), expected, abs_tol=1e-6)


def test_no_current_target_leakage() -> None:
    rows = load("visitor_pressure.csv")
    assert all(
        row["occupancy_rolling_3"] == "" or not math.isclose(float(row["occupancy_rolling_3"]), float(row["occupancy_rate"]), abs_tol=1e-12)
        for row in rows
    )


def test_lag_1_calendar_continuity() -> None:
    lookup = feature_lookup()
    for (region, date_text), row in lookup.items():
        current = date.fromisoformat(date_text)
        previous = lookup.get((region, month_offset(current, -1).isoformat()))
        expected = "" if previous is None else previous["occupancy_rate"]
        assert row["occupancy_lag_1"] == expected


def test_lag_2_calendar_continuity() -> None:
    lookup = feature_lookup()
    for (region, date_text), row in lookup.items():
        current = date.fromisoformat(date_text)
        previous = lookup.get((region, month_offset(current, -2).isoformat()))
        expected = "" if previous is None else previous["occupancy_rate"]
        assert row["occupancy_lag_2"] == expected


def test_rolling_3_excludes_current_target() -> None:
    lookup = feature_lookup()
    for (region, date_text), row in lookup.items():
        current = date.fromisoformat(date_text)
        priors = [lookup.get((region, month_offset(current, -offset).isoformat())) for offset in (1, 2, 3)]
        if all(priors):
            expected = mean(float(prior["occupancy_rate"]) for prior in priors if prior)
            assert math.isclose(float(row["occupancy_rolling_3"]), expected, abs_tol=1e-6)
        else:
            assert row["occupancy_rolling_3"] == ""


def test_no_lag_across_2020_to_2024_gap() -> None:
    rows = [row for row in load("visitor_pressure.csv") if row["year"] == "2024" and row["month"] == "1"]
    assert rows
    assert all(row["occupancy_lag_1"] == row["occupancy_lag_2"] == row["occupancy_lag_3"] == "" for row in rows)


def test_2024_january_does_not_use_2020_december() -> None:
    lookup = feature_lookup()
    regions_2024 = {row["canonical_region"] for row in load("visitor_pressure.csv") if row["year"] == "2024"}
    for region in regions_2024:
        january = lookup[(region, "2024-01-01")]
        december_2020 = lookup[(region, "2020-12-01")]
        assert january["occupancy_lag_1"] == ""
        assert january["occupancy_lag_1"] != december_2020["occupancy_rate"]


def test_2024_february_uses_2024_january() -> None:
    lookup = feature_lookup()
    regions_2024 = {row["canonical_region"] for row in load("visitor_pressure.csv") if row["year"] == "2024"}
    for region in regions_2024:
        assert lookup[(region, "2024-02-01")]["occupancy_lag_1"] == lookup[(region, "2024-01-01")]["occupancy_rate"]


def test_month_sin_cos_correctness() -> None:
    for row in load("visitor_pressure.csv"):
        month = int(row["month"])
        assert math.isclose(float(row["month_sin"]), math.sin(2 * math.pi * month / 12), abs_tol=1e-9)
        assert math.isclose(float(row["month_cos"]), math.cos(2 * math.pi * month / 12), abs_tol=1e-9)


def test_arrival_growth_correctness() -> None:
    arrivals = {
        date(int(row["year"]), int(row["month"]), 1): int(row["total_arrivals"])
        for row in load("monthly_arrivals.csv")
    }
    for row in load("visitor_pressure.csv"):
        current = date.fromisoformat(row["date"])
        previous = arrivals.get(month_offset(current, -1))
        expected = None if previous in (None, 0) else (int(row["total_arrivals"]) - previous) / previous
        if expected is None:
            assert row["arrivals_growth_1m"] == ""
        else:
            assert math.isclose(float(row["arrivals_growth_1m"]), expected, abs_tol=1e-9)


def test_no_fabricated_2021_to_2023_monthly_targets() -> None:
    assert not [row for row in load("canonical_region_month.csv") if row["year"] in {"2021", "2022", "2023"}]


def test_source_resort_region_values_preserved() -> None:
    candidates = [row for row in load("model_candidate_rows.csv") if row["year"] in {"2017", "2018", "2019"}]
    canonical = {
        (row["year"], row["month"], row["canonical_region"]): row
        for row in load("canonical_region_month.csv")
    }
    for row in candidates:
        target = canonical[(row["year"], row["month"], row["canonical_region"])]
        assert float(target["occupancy_rate"]) == float(row["occupancy_rate"])
        assert target["aggregation_method"] == "source_resort_region"
