# CeylonTour backend

Copy the repository `.env.example` to `bk/.env`, replace all placeholder values,
then run commands from the `bk` directory.

```bash
python -m pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Create the initial administrator after applying migrations. The password is read
interactively and is not accepted as a command-line argument:

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
`last_updated` are required. This repository intentionally does not bundle seed
scores: values in automated tests are examples only and are not project research
data.

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

## Regional visitor-pressure forecasting

Training runs offline and requires reviewed external CSV data; this repository
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
attributions, an expected/base value, and a deterministic plain-language
summary of the two strongest model drivers. The one-hot region columns are
combined into one `region` attribution. SHAP values add to the **raw** model
output; the displayed occupancy percentage is bounded to 0–100. These are
model explanations, not causal claims or the exact weighted contributions used
by the Sustainability Index. The backend reuses an explainer while the deployed
artifact files remain unchanged. No LLM is used.

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
