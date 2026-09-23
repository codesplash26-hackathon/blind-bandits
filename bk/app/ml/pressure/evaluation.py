"""Chronological holdout and seasonal-average baseline."""

from dataclasses import dataclass

import pandas as pd
from sklearn.metrics import mean_absolute_error


@dataclass(frozen=True)
class ChronologicalSplit:
    train: pd.DataFrame
    test: pd.DataFrame
    strategy: str
    test_year: int | None


def chronological_split(features: pd.DataFrame) -> ChronologicalSplit:
    months = sorted(features["month"].unique())
    if len(months) < 2:
        raise ValueError("At least two feature-ready months are needed")

    # Prefer the latest fully represented calendar year for all regions.
    regions = set(features["region"])
    for year in sorted(features["month"].dt.year.unique(), reverse=True):
        year_rows = features.loc[features["month"].dt.year == year]
        if (
            year_rows["month"].dt.month.nunique() == 12
            and all(
                set(year_rows.loc[year_rows["region"] == region, "month"].dt.month)
                == set(range(1, 13))
                for region in regions
            )
            and (features["month"] < pd.Timestamp(year=int(year), month=1, day=1)).any()
        ):
            train = features.loc[
                features["month"] < pd.Timestamp(year=int(year), month=1, day=1)
            ]
            test = year_rows
            return ChronologicalSplit(train, test, "latest_complete_year", int(year))

    # Sparse fixture/data fallback: hold out whole recent months, never random rows.
    test_count = max(1, round(len(months) * 0.2))
    first_test_month = months[-test_count]
    return ChronologicalSplit(
        features.loc[features["month"] < first_test_month],
        features.loc[features["month"] >= first_test_month],
        "latest_months_20_percent",
        None,
    )


def calculate_mae(actual: pd.Series, predicted: pd.Series | list[float]) -> float:
    return float(mean_absolute_error(actual, predicted))


def seasonal_average_baseline(train: pd.DataFrame, test: pd.DataFrame) -> list[float]:
    """Historical same-region/same-calendar-month mean, using training only."""
    seasonal = train.groupby(["region", train["month"].dt.month])[
        "occupancy_rate"
    ].mean()
    regional = train.groupby("region")["occupancy_rate"].mean()
    global_mean = float(train["occupancy_rate"].mean())
    return [
        float(
            seasonal.get(
                (row.region, row.month.month), regional.get(row.region, global_mean)
            )
        )
        for row in test.itertuples()
    ]
