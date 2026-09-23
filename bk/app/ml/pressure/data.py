"""Validation of reviewed monthly regional observations and calendar inputs."""

from pathlib import Path

import numpy as np
import pandas as pd

OBSERVATION_COLUMNS = (
    "month",
    "region",
    "occupancy_rate",
    "tourist_arrivals",
    "is_holiday",
    "is_peak_season",
)
CALENDAR_COLUMNS = ("month", "region", "is_holiday", "is_peak_season")


def _validate_months(values: pd.Series) -> pd.Series:
    if pd.api.types.is_datetime64_any_dtype(values):
        if not values.dt.is_month_start.all():
            raise ValueError("month must identify the first day of a month")
        return values
    if not values.astype(str).str.fullmatch(r"\d{4}-(0[1-9]|1[0-2])").all():
        raise ValueError("month must use YYYY-MM with a valid calendar month")
    return pd.to_datetime(values, format="%Y-%m", errors="raise")


def _validate_indicators(frame: pd.DataFrame) -> None:
    for column in ("is_holiday", "is_peak_season"):
        if not frame[column].isin([0, 1, True, False]).all():
            raise ValueError(f"{column} must contain only 0 or 1")
        frame[column] = frame[column].astype(int)


def _validate_common(frame: pd.DataFrame, required: tuple[str, ...]) -> pd.DataFrame:
    missing = set(required) - set(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")
    data = frame.loc[:, list(required)].copy()
    data["month"] = _validate_months(data["month"])
    if (
        data["region"].isna().any()
        or not data["region"]
        .map(lambda value: isinstance(value, str) and bool(value.strip()))
        .all()
    ):
        raise ValueError("region must be a nonempty string")
    data["region"] = data["region"].str.strip()
    if data.duplicated(["region", "month"]).any():
        raise ValueError("Duplicate region/month observation")
    _validate_indicators(data)
    return data.sort_values(["region", "month"]).reset_index(drop=True)


def prepare_observations(frame: pd.DataFrame) -> pd.DataFrame:
    data = _validate_common(frame, OBSERVATION_COLUMNS)
    for column in ("occupancy_rate", "tourist_arrivals"):
        data[column] = pd.to_numeric(data[column], errors="raise")
        if not np.isfinite(data[column]).all():
            raise ValueError(f"{column} must be finite and not missing")
    if not data["occupancy_rate"].between(0, 100).all():
        raise ValueError("occupancy_rate must be between 0 and 100")
    if not data["tourist_arrivals"].ge(0).all():
        raise ValueError("tourist_arrivals must be nonnegative")
    return data


def prepare_calendar(frame: pd.DataFrame) -> pd.DataFrame:
    return _validate_common(frame, CALENDAR_COLUMNS)


def load_observations(path: Path) -> pd.DataFrame:
    return prepare_observations(pd.read_csv(path, dtype={"month": str, "region": str}))


def load_calendar(path: Path) -> pd.DataFrame:
    return prepare_calendar(pd.read_csv(path, dtype={"month": str, "region": str}))
