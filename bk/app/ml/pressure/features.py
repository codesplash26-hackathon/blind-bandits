"""Leakage-free features from past regional monthly observations."""

import pandas as pd

from app.ml.pressure.data import prepare_calendar, prepare_observations

FEATURE_NAMES = (
    "month_number",
    "region",
    "occupancy_lag_1",
    "occupancy_lag_2",
    "occupancy_lag_3",
    "arrivals_lag_1",
    "arrival_trend",
    "is_holiday",
    "is_peak_season",
)


def engineer_features(observations: pd.DataFrame) -> pd.DataFrame:
    data = prepare_observations(observations)
    grouped = data.groupby("region", sort=False)
    for lag in (1, 2, 3):
        data[f"occupancy_lag_{lag}"] = grouped["occupancy_rate"].shift(lag)
        data[f"month_lag_{lag}"] = grouped["month"].shift(lag)
    data["arrivals_lag_1"] = grouped["tourist_arrivals"].shift(1)
    data["arrivals_lag_2"] = grouped["tourist_arrivals"].shift(2)
    for lag in (1, 2, 3):
        expected = data["month"] - pd.DateOffset(months=lag)
        data.loc[data[f"month_lag_{lag}"] != expected, f"occupancy_lag_{lag}"] = float(
            "nan"
        )
    data["arrival_trend"] = (data["arrivals_lag_1"] - data["arrivals_lag_2"]) / data[
        "arrivals_lag_2"
    ].clip(lower=1)
    data["month_number"] = data["month"].dt.month
    return (
        data.dropna(subset=list(FEATURE_NAMES))
        .loc[:, ["month", "occupancy_rate", *FEATURE_NAMES]]
        .reset_index(drop=True)
    )


def build_forecast_inputs(
    observations: pd.DataFrame,
    calendar: pd.DataFrame,
) -> list[dict[str, str | int | float]]:
    """Only next-month contexts are valid; later months need new observed lags."""
    data = prepare_observations(observations)
    future = prepare_calendar(calendar)
    contexts: list[dict[str, str | int | float]] = []
    for region, history in data.groupby("region"):
        recent = history.sort_values("month").tail(3)
        if len(recent) != 3:
            continue
        forecast_month = recent.iloc[-1]["month"] + pd.DateOffset(months=1)
        if not all(
            recent.iloc[-lag]["month"] == forecast_month - pd.DateOffset(months=lag)
            for lag in (1, 2, 3)
        ):
            continue
        matching = future.loc[
            (future["region"] == region) & (future["month"] == forecast_month)
        ]
        if matching.empty:
            continue
        indicator = matching.iloc[0]
        arrival_1 = float(recent.iloc[-1]["tourist_arrivals"])
        arrival_2 = float(recent.iloc[-2]["tourist_arrivals"])
        contexts.append(
            {
                "month": forecast_month.strftime("%Y-%m"),
                "month_number": int(forecast_month.month),
                "region": str(region),
                "occupancy_lag_1": float(recent.iloc[-1]["occupancy_rate"]),
                "occupancy_lag_2": float(recent.iloc[-2]["occupancy_rate"]),
                "occupancy_lag_3": float(recent.iloc[-3]["occupancy_rate"]),
                "arrivals_lag_1": arrival_1,
                "arrival_trend": (arrival_1 - arrival_2) / max(arrival_2, 1),
                "is_holiday": int(indicator["is_holiday"]),
                "is_peak_season": int(indicator["is_peak_season"]),
            }
        )
    return contexts
