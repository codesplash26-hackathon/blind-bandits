# CeylonTour backend

Copy the repository `.env.example` to `bk/.env`, replace all placeholder values,
then run commands from the `bk` directory. Use the virtual environment's Python
to ensure Uvicorn and the application load the same installed dependencies.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m alembic upgrade head
.venv/bin/python -m uvicorn app.main:app --reload
```

For the local hackathon demonstration, apply migrations and then use the
repeatable combined seed. It creates or refreshes the documented demo admin and
adds only the bundled destinations that are not already present:

```bash
python -m app.cli.seed_demo
```

Demo administrator login:

```text
Email: admin@ceylontour.demo
Password: CeylonTourDemo2026!
```

Public registration always creates a `TOURIST`; it cannot create an `ADMIN`.
The public demo credentials must not be used in a production deployment.

To create a private administrator instead, use the interactive command. The
password is not accepted as a command-line argument:

```bash
python -m app.cli.create_admin --name "Site Admin" --email admin@example.com
```

Run tests with `pytest`.

## Destination seed data

Prepared pilot data can be imported from a JSON array after its sources have been
reviewed:

```bash
python -m app.cli.seed_destinations --input /path/to/reviewed-destinations.json
```

Each object uses the same fields as the admin destination-create API. `activities`
is a list of lowercase slugs, and `factor` is optional. If a factor is provided,
all five scores, `data_source`, `confidence_level`, `value_type`, and
`last_updated` are required. The repository includes
`data/demo/destinations.json` only to reproduce the hackathon demonstration
flow. Its factor values are explicitly labelled as low-confidence proxies and
are not project research data. Replace them with reviewed, cited values before
any real-world use.

## Sustainability weights

The Sustainability Index requires a reviewed, versioned weight configuration in
the `SUSTAINABILITY_WEIGHTS` environment variable. No production weights are
bundled with the application. The value must be a JSON object in this shape:

```json
{
  "version": "<reviewed-configuration-version>",
  "weights": {
    "environmental": "<reviewed-weight>",
    "community": "<reviewed-weight>",
    "crowd": "<reviewed-weight>",
    "infrastructure": "<reviewed-weight>",
    "suitability": "<reviewed-weight>"
  }
}
```

Every weight is required, each must be between zero and one, and their sum must
be 1.0. The equal weights used by tests are temporary test fixtures only.

## Recommendation policy

`POST /api/v1/recommendations` uses a deterministic, rules-based policy rather
than machine learning. `typical_budget` is currently treated as the expected
total destination cost, and the requested trip duration must fall within the
destination's recommended minimum and maximum.

Eligible destinations are ranked using requested-interest coverage, crowd fit,
and the existing Sustainability Index. A higher crowd-condition score represents
lower crowd pressure: `QUIET` favors high values, `LIVELY` favors low values, and
`BALANCED` favors values near 50. Sustainability preference uses transparent
temporary policy multipliers of 0.25 (`LOW`), 0.50 (`MEDIUM`), and 1.00 (`HIGH`).
These ranking rules and the current top-five result limit are explicit project
design decisions intended to be tuned after product research.

## Recommendation history and interactions

Each authenticated recommendation request stores its preferences, ordered result
destination IDs, creation time, and the sustainability/ranking configuration
versions. `GET /api/v1/recommendations/history` returns only the signed-in
user's searches, newest first, including searches with no suitable results.

Signed-in users can save, list, and remove destinations through
`POST /api/v1/saved/{destination_id}`, `GET /api/v1/saved`, and
`DELETE /api/v1/saved/{destination_id}`. Saving an already saved destination
returns `409`; a successful save records a `DESTINATION_SAVED` event.

`POST /api/v1/interactions` accepts `DESTINATION_VIEWED`,
`RECOMMENDATION_SELECTED`, and `ALTERNATIVE_SELECTED` with a destination ID.
Selection events also require a `recommendation_search_id` from the current
user's history. A recommendation selection must name a destination returned by
that search. Alternative selections may name a different active destination.
The saved event is emitted by the save endpoint, not submitted separately.

For attributable alternative selections, clients may additionally send
`source_destination_id` (a destination in that user's recommendation result)
and `pressure_month` (`YYYY-MM`) together. The server snapshots both regional
pressure forecasts, bands, and model version in an event-context record. A
trained pressure artifact and configured band thresholds are required for this
context; the request returns `503` if they are unavailable. Older selection
events without context remain valid, but cannot be counted as pressure
redirections. These are regional forecasts, not attraction-level measurements.

`GET /api/v1/admin/analytics?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` is
ADMIN-only. Both dates are inclusive (UTC), with a maximum of 366 days. It
returns search and interaction totals, top interests/destinations, and daily
chart points. "Most saved" counts save events in the range, including
destinations later unsaved; it is not the current saved-list size. A
high-pressure redirection requires a recorded HIGH source band and a strictly
lower selected forecast. Lower-pressure discovery uses the same strict
comparison regardless of source band. The alternative acceptance rate is the
fraction of searches created in the range that have an alternative selection
event in that range. It is a search-to-selection proxy, not an
offer-impression conversion rate. Results are aggregates; no personal search
or event rows are exposed.

## Environmental observations

Run `alembic upgrade head` before refreshing data. An ADMIN can manually fetch
one source at a time with
`POST /api/v1/admin/destinations/{id}/environment/refresh?type=WEATHER` or
`?type=AIR_QUALITY`. Any authenticated user can read the latest stored values
at `GET /api/v1/destinations/{id}/environment`. Reads make no external calls.
Refreshes append a new observation when the provider timestamp changes; a
repeat of the same source/timestamp is reported as `UNCHANGED`. If a provider
fails, the refresh returns the latest stored observation as `FALLBACK` with
its age and stale flag, or `503` if none exists. No background scheduler is
included; `refresh_observation` can be called by a future scheduled job.

Weather comes from the [Open-Meteo current-weather API](https://open-meteo.com/en/docs)
for the destination coordinates. The values include temperature, humidity,
precipitation and weather code. Open-Meteo current conditions are model-based;
precipitation is a backward-looking interval total. Air quality uses the
[OpenAQ v3 API](https://docs.openaq.org/api): it looks for the nearest PM2.5
monitoring station within `OPENAQ_RADIUS_M` (default 25 km), stores the
station ID, name, distance, original unit, and measurement time, and does not
claim an on-site destination measurement or calculate an AQI. OpenAQ requires
`OPENAQ_API_KEY` in the private environment. Its
[latest endpoint](https://docs.openaq.org/resources/latest) is not a complete
historical feed; this application only preserves snapshots fetched by its
refreshes.

Provider URLs, optional Open-Meteo commercial API key, OpenAQ radius, HTTP
timeout, and the stale threshold are
environment-configurable (see `.env.example`). The default stale threshold is
180 minutes for both observation types, based on the provider observation time
rather than our fetch time. This is an initial display policy, not a claim
about scientific validity, and can be tuned. Automated tests use mocked HTTP
responses and never call live providers.

## Regional visitor-pressure forecasting

The deployed visitor-pressure service uses the finalized v2 residual LightGBM
artifact in `ml/artifacts`. It predicts the one-month occupancy change
(`occupancy_rate - occupancy_lag_1`) and reconstructs occupancy as the previous
month's occupancy plus that predicted residual. The saved model is loaded and
cached by file version; API requests never retrain it. Requests are served only
for region/month contexts with all exact lag inputs, and configured regional
aliases (for example, `Southern` to `South Coast`) are resolved before lookup.

The earlier training utility below remains available for isolated development
fixtures. Training runs offline and requires reviewed external CSV data; this repository
does not include or manufacture production tourism observations. The monthly
observations CSV needs `month` (`YYYY-MM`), `region`, `occupancy_rate` (0–100),
`tourist_arrivals`, `is_holiday` (0/1), and `is_peak_season` (0/1). The calendar
CSV needs `month`, `region`, `is_holiday`, and `is_peak_season` for the next month
after each region's last observation. Holiday and season indicators must be
supplied from reviewed sources; the application does not infer them.

```bash
python -m app.cli.train_pressure \
  --observations /path/to/reviewed-monthly-regions.csv \
  --calendar /path/to/reviewed-next-month-calendar.csv \
  --version reviewed-model-version \
  --output-dir artifacts/visitor_pressure
```

The pipeline uses only prior occupancy and arrival values as predictive inputs,
evaluates on a chronological holdout (preferably the latest complete calendar
year), compares model MAE with a training-only same-region/same-month seasonal
average, then refits on all observations for deployment. The output directory
contains a trusted `model.joblib` and `metadata.json`; do not load untrusted
joblib files. Set `PRESSURE_MODEL_ARTIFACT_DIR` to that directory on the API host.
Set `PRESSURE_BAND_THRESHOLDS` to reviewed JSON such as
`{"low_max": <reviewed value>, "medium_max": <reviewed value>}`. No production
band cutoffs are bundled. The endpoint
`GET /api/v1/destinations/{id}/pressure?month=YYYY-MM` requires authentication,
reports **regional monthly occupancy**, and only serves region/month contexts
included in the artifact. It does not claim destination-level precision.

`GET /api/v1/destinations/{id}/pressure/explanation?month=YYYY-MM` returns
the same regional forecast and band, plus the original input values, TreeSHAP
attributions, the base residual, and a deterministic plain-language summary.
The one-hot canonical-region columns are combined into one tourism-region
attribution. SHAP values add to the **predicted residual**, not directly to the
final occupancy forecast. The final forecast is reconstructed separately from
the previous occupancy and residual. These are learned-model attributions, not
causal claims and not the exact weighted arithmetic contributions used by the
Sustainability Index. The backend caches both the artifact and explainer while
the deployed files remain unchanged. No LLM is used.

## Lower-pressure alternatives

`GET /api/v1/destinations/{id}/alternatives?month=YYYY-MM` requires
authentication and uses the same regional pressure artifact and configured
pressure bands as the pressure endpoint. Suggestions are returned only when the
source is in the `HIGH` band. Candidates must be active, have sustainability
factor data, share at least one destination attribute, and have a strictly lower
predicted regional occupancy rate for the requested month. A lower rate can
still be in the `HIGH` band; both the band and percentage-point reduction are
reported explicitly. Regions missing forecast context are skipped. No eligible
candidate yields an empty list with a status explaining why.

Similarity is cosine similarity over one-hot landscape type and activity slugs;
it is shown as both a 0–1 score and percentage. Among eligible destinations,
similarity ranks first, then lower predicted occupancy, shorter straight-line
geographic distance, and ID for stable ties. Straight-line distance is **not**
road distance or travel time. Climate fields do not exist in the current model,
so no climate similarity is inferred. Sustainability scores reuse the reviewed
Sustainability Index weights. These selection rules are explicit design choices
that can be reviewed as pilot evidence grows.

## What-if Sustainability Index calculation

`POST /api/v1/destinations/{id}/simulate` accepts three normalized 0–100
scenario levels: `expected_visitor_level`, `waste_management_level`, and
`infrastructure_level`. These are illustrative inputs, **not measured visitor
counts or a calibrated simulation engine**. The response includes the baseline
scenario, original and simulated factor values, score delta, changed factors,
policy/configuration versions, and a deterministic explanation. No destination
or factor row is updated.

The transformations are intentionally small and separate:

- Visitor level sets the crowd-condition factor to `100 - expected_visitor_level`
  (a higher crowd-condition score means less pressure).
- Waste-management level changes the current environmental factor by its
  difference from a configured reference level, multiplied by a configured
  points-per-level coefficient; the result is bounded to 0–100. Because no
  measured waste baseline is stored, the reference is a policy assumption.
- Infrastructure level directly sets the infrastructure factor. Community and
  tourist-suitability factors stay unchanged. The existing Sustainability Index
  weights recalculate both the original and hypothetical scores.

Set a reviewed, versioned `SIMULATION_POLICY` JSON environment value before
using this endpoint, for example with reviewed values in this shape:

```json
{
  "version": "<reviewed-policy-version>",
  "waste_reference_level": "<reviewed-0-to-100-reference>",
  "environmental_points_per_waste_level": "<reviewed-nonnegative-coefficient>"
}
```

No production reference or coefficient is bundled. The values in automated
tests are temporary examples only. If the policy is absent, the endpoint
returns `503` rather than silently assuming research-backed effects.

## Destination map data

`GET /api/v1/map/destinations?month=YYYY-MM` returns compact, numeric map
markers for active destinations. The month is required because visitor pressure
is a **regional monthly forecast**, not a destination-level measurement.
Optional `region` (case-insensitive) and `pressure=LOW|MEDIUM|HIGH` filters are
available. The response includes the pressure model version and scope.

Map data is read with one projected destination/factor query; the model artifact
is loaded once and each distinct region is predicted once per request. A marker
with missing factor data has null sustainability, environmental, and community
scores. A region without forecast context remains on the unfiltered map with
null pressure fields and is omitted by pressure filters. A nonempty map needs
the configured pressure model and band thresholds; an empty dataset returns an
empty marker list without loading a model. This endpoint supplies data only;
map rendering belongs to the frontend.

## Administrator dashboard

`GET /api/v1/admin/dashboard?month=YYYY-MM` requires an `ADMIN` account. The
month is required because pressure is a regional monthly forecast. The
dashboard reuses the map-data projection, Sustainability Index calculation,
and trained pressure artifact; it does not recalculate scores with separate
rules or retrain a model.

`total_active_destinations` counts active records. `monitored_destinations`
counts active destinations with a forecast for the requested month;
`without_pressure_forecast` is the remainder. Low, medium, and high counts sum
to monitored destinations, not all active records. The highest-pressure table
shows at most five destinations, ordered by predicted occupancy descending and
then ID. Destinations in the same region can share a forecast. Sustainability
averages include active destinations with factor data, even when pressure is
unavailable. Missing averages are null, not zero.

The `recommended_action` object is a deterministic advisory based on the
configured pressure bands: review high-pressure destinations first, otherwise
monitor medium pressure, maintain routine monitoring for low pressure, or
report that no forecast data is available. It does not trigger operational
changes automatically. A nonempty dashboard requires the deployed pressure
artifact and band thresholds; an empty dataset returns zero counts without
loading the model.
