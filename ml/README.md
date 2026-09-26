# Visitor-pressure model experiments

This directory contains the offline, reproducible LightGBM evaluation workflow for
canonical regional monthly occupancy. It does not calculate SHAP values and is not
connected to the FastAPI application.

## Forecast interpretation

Every model is evaluated as a one-month-ahead forecast. Final same-month tourist
arrivals are excluded. The no-lag model uses forecast-month seasonality plus
one- and three-month prior arrival history. The lagged model additionally uses
one, two, and three exact-calendar-month occupancy lags and their prior-only mean.

For the lagged 2024 evaluation, April through December can use actual occupancy
from earlier 2024 months. This is walk-forward evaluation, not a 12-month-ahead
forecast. January 2024 never borrows December 2020 across the target-data gap.

`arrivals_growth_1m` is deliberately excluded because the current engineered
field uses final same-month arrivals. The complete prediction-time availability
classification is generated at `evaluation/feature_availability_audit.csv`.

## Experiments

- A: train on 2017–2019, diagnose separately on abnormal pandemic year 2020,
  and test on 2024.
- B: train on 2017–2020 and test on 2024.
- C: train on 2017–2019, exclude 2020, and test on 2024.

The fixed conservative LightGBM configuration is not tuned on 2024. Seasonal
means are fitted from the corresponding training rows only. Every baseline is
recomputed on the exact rows used by its paired model. Persistence is reported
only where `occupancy_lag_1` genuinely exists.

## Run

Install `ml/requirements.txt` in a Python 3.13 environment, then run from the
repository root:

```bash
python ml/training/train_visitor_pressure.py
python -m pytest tests/data_extraction tests/ml
```

Results are written to `ml/evaluation/`. Versioned model and metadata files are
written to `ml/artifacts/`; the canonical artifact is replaced only when a
comparable new candidate has lower MAE.

## Focused residual round

The v2 round adds exact-calendar-month arrival lags 2 and 3, prior-only arrival
growth/change, and prior occupancy-change features. It compares persistence,
seasonal means, the original direct LightGBM, Ridge, and residual LightGBM on one
shared 2024 row set. Residual predictions are reconstructed as
`occupancy_lag_1 + predicted_residual`.

The bounded LightGBM search, when triggered, uses 2017–2018 for fitting and 2019
for validation. It never uses 2024 for configuration selection.

```bash
python ml/training/train_visitor_pressure_v2.py
python -m pytest tests/data_extraction tests/ml
```

The focused outputs use a `_v2` suffix. A v2 artifact is saved only when the
residual LightGBM beats persistence on the identical final-test rows; the v1
artifact remains untouched.
