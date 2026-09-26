from __future__ import annotations

import csv
from pathlib import Path

import pytest

from scripts.data_extraction.extract_sltda_reports import (
    TOP_LEVEL_REGIONS,
    Report,
    monthly_records,
    normalize_month,
    top_level_region,
)
from scripts.data_extraction.validate_extracted_data import duplicate_keys, validate_rows


REPO_ROOT = Path(__file__).resolve().parents[2]
PROCESSED = REPO_ROOT / "data" / "processed"


def rows(name: str) -> list[dict[str, str]]:
    with (PROCESSED / name).open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def test_month_normalization() -> None:
    assert normalize_month("January") == 1
    assert normalize_month("Sep") == 9
    assert normalize_month(12) == 12
    with pytest.raises(ValueError):
        normalize_month(13)


def _sample_long_records(tmp_path: Path) -> list[dict[str, object]]:
    report = Report(2024, tmp_path / "source.pdf", ())
    values = [1.0, None, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
    return monthly_records(
        year=2024, location="Example", location_type="district",
        monthly_values=values, rooms=None, units=2, annual=None, report=report,
        table="Example", source_page=1,
    )


def test_long_format_conversion(tmp_path: Path) -> None:
    result = _sample_long_records(tmp_path)
    assert len(result) == 12
    assert result[0]["date"] == "2024-01-01"


def test_missing_values_preserved(tmp_path: Path) -> None:
    result = _sample_long_records(tmp_path)
    assert result[1]["occupancy_rate"] is None
    assert result[1]["rooms"] is None


def test_top_level_region_filtering() -> None:
    assert all(top_level_region(name) for name in TOP_LEVEL_REGIONS)
    assert not top_level_region("North of Colombo")
    assert not top_level_region("Kandy Area")


def test_duplicate_detection() -> None:
    row = {"year": "2024", "month": "1", "location": "Badulla", "location_type": "district"}
    assert duplicate_keys([row, row]) == [("2024", "1", "Badulla", "district")]


def test_occupancy_range_validation() -> None:
    occupancy = [{
        "date": "2024-01-01", "year": "2024", "month": "1", "location": "X",
        "location_type": "district", "occupancy_rate": "101", "rooms": "",
        "annual_occupancy_rate": "", "source_granularity": "monthly",
    }]
    errors, _ = validate_rows(occupancy, [], [])
    assert any("outside 0..100" in error for error in errors)


def _occupancy_for(year: int, location: str) -> list[dict[str, str]]:
    return sorted(
        [row for row in rows("occupancy_raw.csv") if int(row["year"]) == year and row["location"] == location],
        key=lambda row: int(row["month"]),
    )


def test_2018_hill_country_sanity_check() -> None:
    result = _occupancy_for(2018, "Hill Country")
    assert [float(row["occupancy_rate"]) for row in result] == [72.06, 71.11, 73.53, 64.17, 66.03, 63.33, 74.68, 77.04, 77.14, 69.16, 75.11, 76.64]
    assert result[0]["rooms"] == "1489"
    assert result[0]["annual_occupancy_rate"] == "71.67"


def test_2020_badulla_sanity_check() -> None:
    result = _occupancy_for(2020, "Badulla")
    assert [float(row["occupancy_rate"]) for row in result] == [64.5, 54.4, 26.1, 2.4, 2.7, 8.1, 11.2, 9.7, 8.8, 9.0, 5.1, 9.9]
    assert result[0]["rooms"] == "286"
    assert result[0]["annual_occupancy_rate"] == "17.2"


def test_2024_badulla_sanity_check() -> None:
    result = _occupancy_for(2024, "Badulla")
    assert [float(row["occupancy_rate"]) for row in result] == [49.4, 54.2, 57.2, 53.6, 29.5, 27.2, 45.0, 57.9, 44.3, 35.4, 47.1, 34.8]
    assert result[0]["rooms"] == ""
    assert result[0]["annual_occupancy_rate"] == "44.6"
