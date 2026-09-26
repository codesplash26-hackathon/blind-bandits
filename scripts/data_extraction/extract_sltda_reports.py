#!/usr/bin/env python3
"""Extract traceable visitor-pressure inputs from official SLTDA PDF reports.

The extractor deliberately uses the PDF text layer through Poppler's ``pdftotext``.
The 2019 report is image-only; its target table is therefore represented by a
visually transcribed, review-required fallback with page-level provenance.
"""

from __future__ import annotations

import argparse
import csv
import re
import shutil
import subprocess
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
MONTH_LOOKUP = {name.lower(): index for index, name in enumerate(MONTHS, 1)}
MONTH_LOOKUP.update({name[:3].lower(): index for index, name in enumerate(MONTHS, 1)})

TOP_LEVEL_REGIONS = (
    "Colombo City", "Greater Colombo", "South Coast", "East Coast",
    "Hill Country", "Ancient Cities", "Northern Region",
)

DISTRICTS_2020 = (
    "Colombo", "Galle", "Gampaha", "Kandy", "Kalutara", "Matale",
    "Hambantota", "Nuwara Eliya", "Matara", "Badulla", "Anuradhapura",
    "Puttalam", "Batticaloa", "Ampara", "Polonnaruwa", "Trincomalee",
    "Ratnapura", "Moneragala", "Jaffna", "Kurunegala", "Kegalle",
    "Vavuniya", "Kilinochchi", "Mullaitivu", "Mannar",
)

DISTRICTS_2024_OCCUPANCY = (
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
    "Kurunegala", "Matale", "Matara", "Moneragala", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Rathnapura", "Trincomalee", "Vavuniya",
)

OCCUPANCY_COLUMNS = [
    "date", "year", "month", "location", "location_type", "occupancy_rate",
    "rooms", "units_or_hotels", "annual_occupancy_rate", "source_year",
    "source_report", "source_table", "source_page", "source_granularity",
    "extraction_method", "needs_manual_review",
]
ARRIVAL_COLUMNS = [
    "date", "year", "month", "total_arrivals", "source_year", "source_report",
    "source_table", "source_page", "extraction_method", "needs_manual_review",
]
ROOM_COLUMNS = [
    "year", "location", "location_type", "rooms", "units_or_hotels",
    "source_report", "source_table", "source_page", "needs_manual_review",
]
REGISTRY_COLUMNS = [
    "source_id", "year", "report_name", "table_name", "page_number",
    "data_type", "geography", "notes",
]
AUDIT_COLUMNS = [
    "year", "report", "table", "page", "status", "rows_extracted", "warnings",
    "manual_review_required",
]

NUMBER_RE = re.compile(r"(?<![A-Za-z])[-+]?\d[\d,]*(?:\.\d+)?")


@dataclass(frozen=True)
class Report:
    year: int
    path: Path
    pages: tuple[str, ...]

    @property
    def name(self) -> str:
        return self.path.name


def normalize_month(value: str | int) -> int:
    if isinstance(value, int):
        if 1 <= value <= 12:
            return value
        raise ValueError(f"month outside 1..12: {value}")
    key = value.strip().lower()
    if key not in MONTH_LOOKUP:
        raise ValueError(f"unrecognized month: {value!r}")
    return MONTH_LOOKUP[key]


def top_level_region(location: str) -> bool:
    return location in TOP_LEVEL_REGIONS


def _number(token: str) -> float | int:
    token = token.replace(",", "")
    return float(token) if "." in token else int(token)


def _numbers(text: str) -> list[float | int]:
    return [_number(match.group(0)) for match in NUMBER_RE.finditer(text)]


def _run_pdftotext(path: Path) -> tuple[str, ...]:
    executable = shutil.which("pdftotext")
    if not executable:
        raise RuntimeError("pdftotext (Poppler) is required but was not found on PATH")
    result = subprocess.run(
        [executable, "-layout", str(path), "-"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return tuple(result.stdout.decode("utf-8", "replace").split("\f"))


def discover_report_dir(repo_root: Path, explicit: Path | None = None) -> Path:
    candidates = [explicit] if explicit else [
        repo_root / "data" / "raw" / "reports",
        repo_root / "data" / "reports",
    ]
    for candidate in candidates:
        if candidate and candidate.is_dir() and any(candidate.glob("*.pdf")):
            return candidate
    shown = ", ".join(str(path) for path in candidates if path)
    raise FileNotFoundError(f"No PDF reports found in: {shown}")


def load_reports(report_dir: Path) -> dict[int, Report]:
    reports: dict[int, Report] = {}
    for path in sorted(report_dir.glob("*.pdf")):
        match = re.search(r"20(?:1[7-9]|2[0-4])", path.name)
        if not match:
            continue
        year = int(match.group(0))
        reports[year] = Report(year, path, _run_pdftotext(path))
    missing = sorted(set(range(2017, 2025)) - reports.keys())
    if missing:
        raise FileNotFoundError(f"Missing report years: {missing}")
    return reports


def page(report: Report, number: int) -> str:
    return report.pages[number - 1]


def values_after_alias(text: str, alias: str, count: int) -> list[float | int]:
    match = re.search(alias, text, re.IGNORECASE)
    if not match:
        raise ValueError(f"Could not locate row alias {alias!r}")
    values = _numbers(text[match.end(): match.end() + 700])
    if len(values) < count:
        raise ValueError(f"Row {alias!r} has only {len(values)} numeric values")
    return values[:count]


def monthly_records(
    *, year: int, location: str, location_type: str,
    monthly_values: Iterable[float | None], rooms: int | None,
    units: int | None, annual: float | None, report: Report,
    table: str, source_page: int, method: str = "pdftotext_layout",
    manual_review: bool = False,
) -> list[dict[str, Any]]:
    values = list(monthly_values)
    if len(values) != 12:
        raise ValueError(f"Expected 12 months for {year} {location}; got {len(values)}")
    result = []
    for month, value in enumerate(values, 1):
        result.append({
            "date": f"{year:04d}-{month:02d}-01",
            "year": year,
            "month": month,
            "location": location,
            "location_type": location_type,
            "occupancy_rate": value,
            "rooms": rooms,
            "units_or_hotels": units,
            "annual_occupancy_rate": annual,
            "source_year": report.year,
            "source_report": report.name,
            "source_table": table,
            "source_page": source_page,
            "source_granularity": "monthly",
            "extraction_method": method,
            "needs_manual_review": manual_review,
        })
    return result


def annual_record(
    *, year: int, location: str, location_type: str, annual: float,
    report: Report, table: str, source_page: int, method: str,
    manual_review: bool,
) -> dict[str, Any]:
    return {
        "date": None, "year": year, "month": None, "location": location,
        "location_type": location_type, "occupancy_rate": None, "rooms": None,
        "units_or_hotels": None, "annual_occupancy_rate": annual,
        "source_year": report.year, "source_report": report.name,
        "source_table": table, "source_page": source_page,
        "source_granularity": "annual", "extraction_method": method,
        "needs_manual_review": manual_review,
    }


def extract_region_occupancy(report: Report, source_page: int, table: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    text = page(report, source_page)
    aliases = {
        "Colombo City": r"Colombo City",
        "Greater Colombo": r"Greater(?:\s*\n)?",
        "South Coast": r"South Coast",
        "East Coast": r"East Coast",
        "Hill Country": r"Hill Country",
        "Ancient Cities": r"Ancient Ci(?:ties|\s*es)",
        "Northern Region": r"Northern Region",
    }
    occupancy: list[dict[str, Any]] = []
    rooms: list[dict[str, Any]] = []
    for location, alias in aliases.items():
        values = values_after_alias(text, alias, 15)
        units, room_count = int(values[0]), int(values[1])
        months = [float(value) for value in values[2:14]]
        annual = float(values[14])
        occupancy.extend(monthly_records(
            year=report.year, location=location, location_type="resort_region",
            monthly_values=months, rooms=room_count, units=units, annual=annual,
            report=report, table=table, source_page=source_page,
        ))
        rooms.append(room_record(
            year=report.year, location=location, rooms=room_count, units=units,
            report=report, table=table, source_page=source_page,
            location_type="resort_region", manual_review=False,
        ))
    return occupancy, rooms


# The 2019 PDF has no text layer. Values below are a page-91 visual transcription
# of Table 23 and are always flagged for independent human verification.
TRANSCRIBED_2019 = {
    "Colombo City": [44, 5638, 84.34, 83.11, 76.91, 74.73, 14.32, 21.92, 46.05, 55.31, 48.77, 53.45, 72.71, 73.21, 58.74],
    "Greater Colombo": [60, 3052, 80.83, 78.76, 76.15, 69.49, 14.97, 22.84, 43.37, 55.66, 50.47, 54.32, 73.48, 74.49, 57.90],
    "South Coast": [182, 8695, 80.06, 77.10, 71.57, 65.58, 17.26, 24.68, 46.72, 59.46, 55.22, 59.55, 78.11, 80.88, 59.68],
    "East Coast": [31, 1201, 78.91, 76.24, 73.89, 64.23, 13.40, 22.03, 49.39, 59.64, 48.91, 55.73, 73.66, 71.68, 57.31],
    "Hill Country": [48, 1548, 78.40, 76.77, 72.84, 65.68, 14.69, 22.44, 46.85, 57.86, 52.35, 54.79, 71.39, 75.31, 57.45],
    "Ancient Cities": [101, 4462, 76.73, 76.86, 74.05, 59.75, 14.94, 23.09, 47.87, 55.67, 52.90, 52.19, 74.07, 75.41, 56.96],
    "Northern Region": [8, 235, 70.71, 72.92, 64.86, 49.23, 12.52, 19.35, 38.91, 44.88, 39.63, 42.92, 62.44, 64.86, 48.55],
}


def extract_2019_occupancy(report: Report) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    occupancy: list[dict[str, Any]] = []
    rooms: list[dict[str, Any]] = []
    table = "Table 23: Monthly Occupancy Rates in Tourist Hotels by Region – 2019"
    for location, values in TRANSCRIBED_2019.items():
        units, room_count = int(values[0]), int(values[1])
        occupancy.extend(monthly_records(
            year=2019, location=location, location_type="resort_region",
            monthly_values=values[2:14], rooms=room_count, units=units,
            annual=float(values[14]), report=report, table=table, source_page=91,
            method="visual_transcription_image_only_pdf", manual_review=True,
        ))
        rooms.append(room_record(
            year=2019, location=location, rooms=room_count, units=units,
            report=report, table=table, source_page=91,
            location_type="resort_region", manual_review=True,
        ))
    return occupancy, rooms


def extract_line_rows(
    text: str, names: Iterable[str], count: int,
) -> dict[str, list[float | int]]:
    result: dict[str, list[float | int]] = {}
    for source_line in text.splitlines():
        line = source_line.strip()
        for name in names:
            if re.match(re.escape(name) + r"\s", line, re.IGNORECASE):
                values = _numbers(line[len(name):])
                if len(values) >= count:
                    result[name] = values[:count]
                break
    return result


def extract_2020_occupancy(report: Report) -> list[dict[str, Any]]:
    rows = extract_line_rows(page(report, 92), DISTRICTS_2020, 15)
    missing = sorted(set(DISTRICTS_2020) - rows.keys())
    if missing:
        raise ValueError(f"2020 occupancy rows missing: {missing}")
    output: list[dict[str, Any]] = []
    table = "Table 21: Monthly Occupancy Rates in Tourist Hotels by District – 2020"
    for location in DISTRICTS_2020:
        values = rows[location]
        output.extend(monthly_records(
            year=2020, location=location, location_type="district",
            monthly_values=[float(value) for value in values[2:14]],
            rooms=int(values[1]), units=int(values[0]), annual=float(values[14]),
            report=report, table=table, source_page=92,
        ))
    return output


def extract_2024_occupancy(report: Report) -> list[dict[str, Any]]:
    rows = extract_line_rows(page(report, 42), DISTRICTS_2024_OCCUPANCY, 14)
    missing = sorted(set(DISTRICTS_2024_OCCUPANCY) - rows.keys())
    if missing:
        raise ValueError(f"2024 occupancy rows missing: {missing}")
    output: list[dict[str, Any]] = []
    table = "Table 19: Occupancy of graded establishments from different districts by months, 2024"
    for location in DISTRICTS_2024_OCCUPANCY:
        values = rows[location]
        output.extend(monthly_records(
            year=2024, location=location, location_type="district",
            monthly_values=[float(value) for value in values[1:13]], rooms=None,
            units=int(values[0]), annual=float(values[13]), report=report,
            table=table, source_page=42,
        ))
    return output


TRANSCRIBED_2021_ANNUAL = {
    "Colombo": 19.4, "Galle": 20.2, "Kalutara": 34.9, "Kandy": 31.6,
    "Gampaha": 24.0, "Matale": 37.3, "Hambantota": 32.1,
    "Nuwara Eliya": 12.6, "Puttalam": 16.1, "Anuradhapura": 26.7,
    "Batticaloa": 8.6, "Matara": 23.3, "Polonnaruwa": 10.0,
    "Trincomalee": 23.3, "Badulla": 1.6, "Moneragala": 27.3,
    "Ratnapura": 8.1, "Jaffna": 16.9, "Ampara": 0.0,
    "Kurunegala": 2.7, "Kegalle": 0.8, "Vavuniya": 12.2, "Mannar": 0.0,
}


def extract_annual_occupancy(reports: dict[int, Report]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    report = reports[2021]
    table = "Chart 08: District wise distribution of occupancy rates of SLTDA Registered Tourists Hotels, 2021"
    output.append(annual_record(
        year=2021, location="Sri Lanka", location_type="national", annual=18.96,
        report=report, table="Average Annual Occupancy Rate – 2021", source_page=19,
        method="pdftotext_layout", manual_review=False,
    ))
    for location, value in TRANSCRIBED_2021_ANNUAL.items():
        output.append(annual_record(
            year=2021, location=location, location_type="district", annual=value,
            report=report, table=table, source_page=19,
            method="visual_transcription_chart", manual_review=True,
        ))
    output.append(annual_record(
        year=2022, location="Sri Lanka", location_type="national", annual=30.4,
        report=reports[2022], table="Annual room occupancy rate (graded) – 2022",
        source_page=3, method="pdftotext_layout", manual_review=False,
    ))
    output.append(annual_record(
        year=2023, location="Sri Lanka", location_type="national", annual=39.0,
        report=reports[2023], table="Table 14: Tourism Growth Trends 1985 to 2023",
        source_page=82, method="pdftotext_layout", manual_review=False,
    ))
    return output


def parse_historical_arrival_row(text: str, year: int) -> list[int]:
    for line in text.splitlines():
        if re.match(rf"\s*{year}\s", line):
            values = _numbers(line)
            if len(values) >= 14 and int(values[0]) == year:
                return [int(value) for value in values[1:13]]
    raise ValueError(f"Could not find historical monthly-arrival row for {year}")


def parse_comparison_arrivals(text: str, value_index: int = 1) -> list[int]:
    values: dict[int, int] = {}
    for line in text.splitlines():
        for month_number, month_label in enumerate(MONTHS, 1):
            month_name = month_label.lower()
            if re.match(month_name + r"\s", line.strip().lower()):
                numbers = _numbers(line)
                if len(numbers) > value_index:
                    values[month_number] = int(numbers[value_index])
                break
    if len(values) != 12:
        raise ValueError(f"Expected 12 comparison-table months; got {sorted(values)}")
    return [values[index] for index in range(1, 13)]


def arrival_records(
    *, year: int, values: list[int], report: Report, table: str,
    source_page: int,
) -> list[dict[str, Any]]:
    return [{
        "date": f"{year:04d}-{month:02d}-01", "year": year, "month": month,
        "total_arrivals": value, "source_year": report.year,
        "source_report": report.name, "source_table": table,
        "source_page": source_page, "extraction_method": "pdftotext_layout",
        "needs_manual_review": False,
    } for month, value in enumerate(values, 1)]


def extract_arrivals(reports: dict[int, Report]) -> list[dict[str, Any]]:
    specifications = {
        2017: (reports[2017], 92, "Tourist Arrivals by Month – 1971 to 2017", "historical"),
        2018: (reports[2018], 104, "Table 29: Tourist Arrivals by Month 1971 to 2018", "historical"),
        2019: (reports[2020], 102, "Table 29: Tourist Arrivals by Month – 1971 to 2020", "historical"),
        2020: (reports[2020], 102, "Table 29: Tourist Arrivals by Month – 1971 to 2020", "historical"),
        2021: (reports[2021], 4, "Table 01: Tourist arrivals to Sri Lanka by month & percentage change, 2020 & 2021", "comparison"),
        2022: (reports[2022], 4, "Table 01: Tourist arrivals by month & percentage change, 2021 & 2022", "comparison"),
        2023: (reports[2023], 84, "Table 15: Tourist Arrivals by Month 1971 to 2023", "historical"),
        2024: (reports[2024], 4, "Table 01: Tourist arrivals by month & percentage change, 2023 & 2024", "comparison"),
    }
    output: list[dict[str, Any]] = []
    for year, (report, page_number, table, kind) in specifications.items():
        text = page(report, page_number)
        values = (parse_historical_arrival_row(text, year) if kind == "historical"
                  else parse_comparison_arrivals(text, 1))
        output.extend(arrival_records(
            year=year, values=values, report=report, table=table,
            source_page=page_number,
        ))
    return output


def room_record(
    *, year: int, location: str, rooms: int, units: int | None,
    report: Report, table: str, source_page: int, location_type: str = "district",
    manual_review: bool = False,
) -> dict[str, Any]:
    return {
        "year": year, "location": location, "location_type": location_type,
        "rooms": rooms, "units_or_hotels": units, "source_report": report.name,
        "source_table": table, "source_page": source_page,
        "needs_manual_review": manual_review,
    }


def extract_room_table(
    *, report: Report, source_page: int, year: int, names: Iterable[str],
    table: str,
) -> list[dict[str, Any]]:
    text = page(report, source_page)
    output = []
    for name in names:
        room_count: int | None = None
        pattern = re.compile(rf"(?<![A-Za-z]){re.escape(name)}\s+([\d,]+)(?![\d.])", re.IGNORECASE)
        for line in text.splitlines():
            match = pattern.search(line)
            if match:
                room_count = int(match.group(1).replace(",", ""))
                break
        if room_count is None:
            raise ValueError(f"Could not locate same-line room count for {year} {name}")
        output.append(room_record(
            year=year, location=name, rooms=room_count, units=None,
            report=report, table=table, source_page=source_page,
        ))
    return output


def extract_district_rooms(reports: dict[int, Report]) -> list[dict[str, Any]]:
    names_2021 = (
        "Colombo", "Galle", "Gampaha", "Kalutara", "Kandy", "Matale", "Matara",
        "Nuwara Eliya", "Hambantota", "Badulla", "Anuradhapura", "Puttalam",
        "Batticaloa", "Ampara", "Trincomalee", "Polonnaruwa", "Ratnapura",
        "Moneragala", "Jaffna", "Kurunegala", "Kegalle", "Vavuniya",
        "Kilinochchi", "Mullaitivu", "Mannar",
    )
    names_2022 = (
        "Colombo", "Galle", "Gampaha", "Kaluthara", "kandy", "Matale", "Matara",
        "Nuwara Eliya", "Hambantota", "Badulla", "Anuradhapura", "Puttalam",
        "Batticaloa", "Ampara", "Trincomalee", "Polonnaruwa", "Ratnapura",
        "Moneragala", "Jaffna", "Kurunegala", "Kegalle", "Vavuniya",
        "Kilinochchi", "Mullaitivu", "Mannar",
    )
    names_2023 = (
        "Colombo", "Galle", "Gampaha", "Kandy", "Kalutara", "Matara", "Hambantota",
        "Matale", "Nuwara Eliya", "Badulla", "Anuradhapura", "Puttlam",
        "Batticaloa", "Ampara", "Trincomalee", "Monaragala", "Rathnapura",
        "Polonnaruwa", "Kegalle", "Jaffna", "Kurunegala", "Vavuniya",
        "Kilinochchi", "Mullaitivu", "Mannar",
    )
    names_2024 = (
        "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
        "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
        "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
        "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Rathnapura",
        "Trincomalee", "Vavuniya",
    )
    output: list[dict[str, Any]] = []
    output += extract_room_table(
        report=reports[2020], source_page=89, year=2020, names=DISTRICTS_2020,
        table="Table 18: Room Distribution by District wise and Provincial wise",
    )
    output += extract_room_table(
        report=reports[2021], source_page=17, year=2021, names=names_2021,
        table="Table 06: District wise distribution of rooms of SLTDA registered accommodation establishments, 2020 and 2021",
    )
    output += extract_room_table(
        report=reports[2022], source_page=17, year=2022, names=names_2022,
        table="Table 08: District wise distribution of rooms of SLTDA registered accommodation establishments, 2021 and 2022",
    )
    output += extract_room_table(
        report=reports[2023], source_page=38, year=2023, names=names_2023,
        table="Table IX: Distribution of rooms by districts",
    )
    output += extract_room_table(
        report=reports[2024], source_page=20, year=2024, names=names_2024,
        table="Table 09: Total rooms by districts",
    )
    return output


def registry_rows(occupancy: list[dict[str, Any]], arrivals: list[dict[str, Any]], rooms: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sources: dict[tuple[Any, ...], dict[str, Any]] = {}
    collections = [
        (occupancy, "occupancy", "location_type"),
        (arrivals, "tourist_arrivals", None),
        (rooms, "room_capacity", "location_type"),
    ]
    for rows, data_type, geography_key in collections:
        for row in rows:
            key = (row["source_report"], row["source_table"], row["source_page"], data_type)
            if key in sources:
                continue
            geography = "national" if geography_key is None else row[geography_key]
            note = ""
            if row.get("needs_manual_review"):
                note = "Source is image/chart based; transcription requires independent manual verification."
            sources[key] = {
                "year": row.get("source_year", row["year"]),
                "report_name": row["source_report"], "table_name": row["source_table"],
                "page_number": row["source_page"], "data_type": data_type,
                "geography": geography, "notes": note,
            }
    output = []
    for index, item in enumerate(sorted(sources.values(), key=lambda x: (x["year"], x["page_number"], x["data_type"])), 1):
        output.append({"source_id": f"SLTDA-{index:03d}", **item})
    return output


def audit_rows(occupancy: list[dict[str, Any]], arrivals: list[dict[str, Any]], rooms: list[dict[str, Any]], reports: dict[int, Report]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []

    def add(year: int, report: Report, table: str, source_page: int | None, status: str,
            count: int, warning: str = "", manual: bool = False) -> None:
        output.append({
            "year": year, "report": report.name, "table": table, "page": source_page,
            "status": status, "rows_extracted": count, "warnings": warning,
            "manual_review_required": manual,
        })

    for year, page_number, table in [
        (2017, 82, "Table 23: Monthly Occupancy Rates in Tourist Hotels by Region – 2017"),
        (2018, 94, "Table 22: Monthly Occupancy Rates in Tourist Hotels by Region – 2018"),
        (2019, 91, "Table 23: Monthly Occupancy Rates in Tourist Hotels by Region – 2019"),
        (2020, 92, "Table 21: Monthly Occupancy Rates in Tourist Hotels by District – 2020"),
        (2024, 42, "Table 19: Occupancy of graded establishments from different districts by months, 2024"),
    ]:
        count = sum(row["year"] == year and row["source_granularity"] == "monthly" for row in occupancy)
        manual = year == 2019
        add(year, reports[year], table, page_number,
            "manual_review_required" if manual else "extracted", count,
            "Image-only PDF; top-level rows visually transcribed and flagged." if manual else "",
            manual)

    add(2021, reports[2021], "Chart 08: District wise annual occupancy, 2021", 19,
        "manual_review_required", sum(row["year"] == 2021 for row in occupancy),
        "Chart labels were visually transcribed; report narrative conflicts with some plotted labels.", True)
    for year in (2021, 2022, 2023):
        add(year, reports[year], "Monthly district occupancy", None, "not_found", 0,
            "The report does not contain a Jan–Dec district occupancy table; no monthly values were fabricated.")
    add(2022, reports[2022], "Annual room occupancy rate (graded) – 2022", 3,
        "extracted", 1)
    add(2023, reports[2023], "Table 14: Tourism Growth Trends 1985 to 2023", 82,
        "extracted", 1, "National annual graded occupancy only; no district monthly values present.")

    arrival_sources = defaultdict(list)
    for row in arrivals:
        arrival_sources[row["year"]].append(row)
    for year in range(2017, 2025):
        first = arrival_sources[year][0]
        warning = ""
        status = "extracted"
        if year == 2020:
            status = "partial"
            warning = "The 2020 report's monthly values sum to 507,311 while its printed total is 507,704; values were preserved as printed. The 2021 report later shows December 2020 as 393."
        source_report = next(report for report in reports.values() if report.name == first["source_report"])
        add(year, source_report, first["source_table"], first["source_page"], status, 12, warning)

    room_sources = defaultdict(list)
    for row in rooms:
        room_sources[row["year"]].append(row)
    for year in range(2017, 2025):
        first = room_sources[year][0]
        report = next(report for report in reports.values() if report.name == first["source_report"])
        manual = any(row["needs_manual_review"] for row in room_sources[year])
        add(year, report, first["source_table"], first["source_page"],
            "manual_review_required" if manual else "extracted", len(room_sources[year]),
            "Image-only source table; room counts require manual verification." if manual else "", manual)
    return output


def _serialize(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    return value


def write_csv(path: Path, columns: list[str], rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="raise")
        writer.writeheader()
        for row in rows:
            writer.writerow({column: _serialize(row.get(column)) for column in columns})


def build_datasets(reports: dict[int, Report]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    occupancy: list[dict[str, Any]] = []
    rooms: list[dict[str, Any]] = []
    for year, page_number, table in [
        (2017, 82, "Table 23: Monthly Occupancy Rates in Tourist Hotels by Region – 2017"),
        (2018, 94, "Table 22: Monthly Occupancy Rates in Tourist Hotels by Region – 2018"),
    ]:
        occ, capacity = extract_region_occupancy(reports[year], page_number, table)
        occupancy += occ
        rooms += capacity
    occ_2019, rooms_2019 = extract_2019_occupancy(reports[2019])
    occupancy += occ_2019
    rooms += rooms_2019
    occupancy += extract_2020_occupancy(reports[2020])
    occupancy += extract_annual_occupancy(reports)
    occupancy += extract_2024_occupancy(reports[2024])
    rooms += extract_district_rooms(reports)
    arrivals = extract_arrivals(reports)
    registry = registry_rows(occupancy, arrivals, rooms)
    audit = audit_rows(occupancy, arrivals, rooms, reports)
    return occupancy, arrivals, rooms, registry, audit


def generate(repo_root: Path, report_dir: Path | None = None, output_dir: Path | None = None) -> dict[str, Any]:
    resolved_report_dir = discover_report_dir(repo_root, report_dir)
    reports = load_reports(resolved_report_dir)
    occupancy, arrivals, rooms, registry, audit = build_datasets(reports)
    target = output_dir or repo_root / "data" / "processed"
    write_csv(target / "occupancy_raw.csv", OCCUPANCY_COLUMNS, occupancy)
    write_csv(target / "monthly_arrivals.csv", ARRIVAL_COLUMNS, arrivals)
    write_csv(target / "room_capacity.csv", ROOM_COLUMNS, rooms)
    write_csv(target / "source_registry.csv", REGISTRY_COLUMNS, registry)
    write_csv(target / "extraction_audit.csv", AUDIT_COLUMNS, audit)
    return {
        "report_dir": resolved_report_dir, "pdfs": [report.path for report in reports.values()],
        "occupancy_rows": len(occupancy), "arrival_rows": len(arrivals),
        "room_rows": len(rooms),
        "manual_review_rows": sum(bool(row["needs_manual_review"]) for row in occupancy + arrivals + rooms),
        "output_dir": target,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--report-dir", type=Path)
    parser.add_argument("--output-dir", type=Path)
    args = parser.parse_args()
    summary = generate(args.repo_root.resolve(), args.report_dir, args.output_dir)
    print(f"Detected {len(summary['pdfs'])} PDFs in {summary['report_dir']}")
    print(f"Wrote {summary['occupancy_rows']} occupancy rows")
    print(f"Wrote {summary['arrival_rows']} monthly-arrival rows")
    print(f"Wrote {summary['room_rows']} room-capacity rows")
    print(f"Flagged {summary['manual_review_rows']} data rows for manual review")
    print(f"Output directory: {summary['output_dir']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
