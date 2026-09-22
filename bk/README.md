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
