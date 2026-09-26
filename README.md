# CeylonTour

**Explainable, sustainability-aware travel recommendations for Sri Lanka**

CeylonTour helps travellers discover destinations that fit their interests, budget, trip length, crowd preference, and sustainability preference. It combines a transparent five-factor Sustainability Index with a regional visitor-pressure forecast, explains the result in plain language, and suggests lower-pressure alternatives when appropriate.

The project addresses two connected problems: visitors are concentrated at a small number of famous attractions, while less-visited communities receive fewer tourism benefits; and travellers have little trustworthy information about why an alternative may be more sustainable.

> Hackathon submission status: functional prototype. The implemented scope and all deviations from the proposal are documented below.

## Team

**Blind Bandits - University of Moratuwa**

- O.P.N.Y.K. Bandara - Team Leader
- K.A.D.D. Dananjana - Team Member

## Implemented features

| Area | Current implementation |
| --- | --- |
| Traveller experience | Landing page, registration/login, destination catalogue and details, saved destinations, recommendation history, and profile views |
| Recommendations | Deterministic filtering and ranking by interests, budget, duration, crowd preference, and Sustainability Index |
| Sustainability | Configurable, versioned five-factor index with exact factor contributions |
| Visitor pressure | One-month regional occupancy forecast using a trained residual LightGBM model |
| Explainability | TreeSHAP pressure contributions, exact sustainability contributions, and deterministic plain-language summaries |
| Alternatives | Similar destinations with a strictly lower regional pressure forecast when the source is high pressure |
| What-if analysis | Sustainability-factor simulator showing score and factor changes |
| Map | API-backed schematic Sri Lanka destination map with sustainability and pressure filters |
| Authority tools | Role-protected dashboard, analytics, destination management, pressure views, and environmental refresh controls |
| Environmental data | Open-Meteo weather and OpenAQ PM2.5 snapshot ingestion with stored fallback and stale-data indicators |
| Engagement | Saved places, searches, selections, and pressure-redirection metrics |

FastAPI also exposes interactive OpenAPI documentation at `http://localhost:8000/docs` while the backend is running.

## Architecture

```text
Next.js web application (fr/)
          |
          | JSON/HTTP + JWT
          v
FastAPI application (bk/) ---- PostgreSQL
          |
          +---- versioned sustainability and simulation policies
          +---- trained LightGBM + TreeSHAP artifacts (ml/)
          +---- Open-Meteo and OpenAQ (admin-triggered refresh)

SLTDA source reports -> extraction/validation scripts -> model datasets -> offline training
```

The web application never trains models. Training and evaluation are offline, and the API loads the committed, versioned model artifact for inference.

## Technology stack and rationale

| Technology | Use and rationale |
| --- | --- |
| Next.js 16, React 19, TypeScript, Tailwind CSS | Component-based responsive web interface and data-rich dashboards |
| FastAPI, Pydantic, SQLAlchemy, Alembic | Typed API, request validation, safe ORM queries, and repeatable schema migrations |
| PostgreSQL | Relational storage for users, destinations, factors, searches, interactions, and observations |
| LightGBM, scikit-learn, pandas, NumPy | Efficient, reproducible tabular forecasting on a small dataset |
| SHAP | Local and global explanations for the visitor-pressure model |
| Recharts | Authority analytics visualizations |
| Open-Meteo, OpenAQ, SLTDA reports | Weather, PM2.5 observations, and official tourism statistics |
| pytest and Ruff | Automated backend/ML checks and Python linting |

## Repository layout

```text
bk/       FastAPI application, migrations, CLI utilities, and API tests
fr/       Next.js application
data/     SLTDA source reports, traceable extracts, and validation outputs
ml/       training code, evaluation results, SHAP outputs, and model artifacts
scripts/  reproducible data-extraction and dataset-building scripts
tests/    data-pipeline and ML tests
```

More detail is available in `bk/README.md`, `ml/README.md`, and `data/README.md`.

## Local setup

### Prerequisites

- Python 3.13
- Node.js 20.9 or newer and npm
- PostgreSQL 16 (a standard PostgreSQL installation is sufficient)
- Poppler only if re-running extraction from the source PDFs

No GPU is required.

### 1. Create the database

Create an empty PostgreSQL database and a database user with permission to create and modify tables. For example, name the database `ceylontour`.

### 2. Configure and run the backend

From the repository root:

```bash
cd bk
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m pip install -r ../ml/requirements.txt
cp ../.env.example .env
```

Use the following complete backend configuration in `bk/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/ceylontour
JWT_SECRET_KEY=replace-with-a-random-secret-at-least-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
SUSTAINABILITY_WEIGHTS={"version":"example-v1","weights":{"environmental":0.30,"community":0.20,"crowd":0.20,"infrastructure":0.15,"suitability":0.15}}
PRESSURE_MODEL_ARTIFACT_DIR=../ml/artifacts
PRESSURE_BAND_THRESHOLDS={"low_max":40,"medium_max":70}
SIMULATION_POLICY={"version":"example-v1","waste_reference_level":50,"environmental_points_per_waste_level":0.5}
OPEN_METEO_URL=https://api.open-meteo.com/v1/forecast
OPENAQ_URL=https://api.openaq.org/v3
OPENAQ_API_KEY=
OPENAQ_RADIUS_M=25000
ENVIRONMENT_STALE_AFTER_MINUTES=180
ENVIRONMENT_HTTP_TIMEOUT_SECONDS=10
```

Before starting the application:

- replace `DATABASE_URL` with a valid SQLAlchemy URL, such as `postgresql+psycopg://USER:PASSWORD@localhost:5432/ceylontour`;
- replace `JWT_SECRET_KEY` with a random secret of at least 32 characters;
- review the example sustainability weights, pressure bands, and simulation policy before any real use;
- leave `OPEN_METEO_URL` at its default public endpoint unless a different compatible endpoint is required;
- set `OPENAQ_API_KEY` to a valid private OpenAQ API key if air-quality refresh is required; an empty value disables authenticated OpenAQ requests;
- `OPENAQ_RADIUS_M=25000` searches for a monitoring station within 25 km, which is also the maximum accepted by the backend;
- `ENVIRONMENT_STALE_AFTER_MINUTES` controls when stored environmental observations are labelled stale, and `ENVIRONMENT_HTTP_TIMEOUT_SECONDS` controls provider request timeouts;
- keep `PRESSURE_MODEL_ARTIFACT_DIR=../ml/artifacts` when launching from `bk/`.

Then apply the schema and start the API:

```bash
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

### 3. Prepare the hackathon demo data

After applying the migration, run the repeatable demo seed once:

```bash
cd bk
source .venv/bin/activate
python -m app.cli.seed_demo
```

This creates or refreshes the judge-ready administrator and inserts the six demo destinations that are not already present:

```text
Email: admin@ceylontour.demo
Password: CeylonTourDemo2026!
```

Public registration deliberately creates `TOURIST` accounts only. Use the credentials above to open the admin interface. The seed command is safe to rerun: it restores the documented admin name, password, role, and active status, skips destinations already identified by the same slug, and adds any missing records.

These credentials and destination values are for the local hackathon demonstration only. Do not run this seed in a public or production deployment. Create a private authority account instead; this command prompts for its password so the password is not stored in shell history:

```bash
cd bk
source .venv/bin/activate
python -m app.cli.create_admin --name "Site Admin" --email admin@example.com
```

### 4. Load reviewed destination data

The application deliberately does not invent sustainability values. Import a reviewed JSON array using:

```bash
cd bk
source .venv/bin/activate
python -m app.cli.seed_destinations --input /absolute/path/to/reviewed-destinations.json
```

The expected fields and provenance requirements are described in `bk/README.md`. Every factor set must include its source, confidence, value type, and last-updated date.

The combined demo command above loads the bundled six records. To load only those destinations without resetting the demo administrator, run:

```bash
python -m app.cli.seed_destinations --input ../data/demo/destinations.json
```

These values reproduce the UI flow; they are not reviewed sustainability research and must not be presented as measured conditions.

### 5. Configure and run the frontend

Create `fr/.env.local` containing:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Then run:

```bash
cd fr
npm ci
npm run dev
```

Open `http://localhost:3000`. Register a tourist through the UI or sign in with the seeded demo administrator.

## Verification

With the backend/ML environment installed and `bk/.env` configured:

```bash
cd bk
source .venv/bin/activate
python -m pytest -q tests

cd ..
bk/.venv/bin/python -m pytest -q tests/data_extraction tests/ml

cd fr
npm run lint
npm run build
```

The API tests use an isolated test database and mocked external HTTP responses. They do not call live weather or air-quality services.

## Data and model notes

- Visitor pressure means **regional monthly graded-accommodation occupancy**, not a live crowd count and not attraction-level occupancy.
- The deployed v2 model predicts the change from the previous month's occupancy and reconstructs the final forecast.
- SHAP values explain the model's predicted residual; they are non-causal and are not the same as the exact Sustainability Index contributions.
- The model is evaluated chronologically against persistence and seasonal baselines. Evaluation files and plots are committed under `ml/evaluation/`.
- Source reports and the extraction/normalization audit trail are under `data/`.

## Known limitations and assumptions

- Redis caching was not implemented. Only process-local caching of the loaded model/explainer is used, so cache state is not shared across API workers.
- Production security hardening is incomplete. The prototype has Argon2 password hashing, JWT authentication, role checks, validation, SQLAlchemy parameterization, CORS configuration, and environment-based secrets; it does **not** yet include application rate limiting, refresh-token rotation/revocation, secure HTTP-only cookie storage, a user self-service data-deletion flow, or application-managed HTTPS. HTTPS must be terminated by the deployment platform or reverse proxy.
- Docker/Docker Compose and GitHub Actions were not completed; setup and verification are currently manual.
- PostgreSQL is used without PostGIS. Latitude/longitude are stored as numeric columns and distance calculations are application-side.
- Environmental refresh is admin-triggered; there is no background scheduler.
- The map is a schematic coordinate projection rather than Leaflet/OpenStreetMap tiles.
- The bundled six-destination seed is demo-only, low-confidence proxy data. It reproduces the application flow but is not a production-ready sustainability dataset; reviewed destination values are still required for real-world use.
- Forecast coverage is limited to region/month contexts with the exact lag inputs required by the artifact. Missing contexts are reported rather than guessed.
- Sustainability weights, pressure thresholds, and simulator policy values in `.env.example` are demonstration configuration and need domain-expert review before real-world use.
- The frontend currently stores the access token in browser local storage, which is acceptable for this prototype but should be replaced as part of production security hardening.
- No public production deployment URL is included in this repository.

## Change Log: Proposal-to-Implementation Changes

These changes are documented to satisfy the hackathon requirement for transparent technical deviations.

| Proposed approach | Final prototype | Reason |
| --- | --- | --- |
| Python 3.11 | Python 3.13 | Used the team's current supported development environment and dependency set |
| PostgreSQL 16 with PostGIS | PostgreSQL without PostGIS | The pilot only needs stored coordinates and small in-memory distance calculations |
| Redis for caching | No Redis; process-local artifact/explainer caching | Prioritized the complete end-to-end product flow before the deadline |
| Docker and Docker Compose | Manual Python/Node/PostgreSQL setup | Container packaging was deferred to protect time for functional features and tests |
| GitHub Actions | Local verification commands | CI workflow configuration was not completed before the deadline |
| Scheduled weather/air-quality jobs | Admin-triggered refresh with stored fallback | Preserves source traceability and fallback behavior without deploying a scheduler |
| Leaflet with OpenStreetMap | API-backed schematic Sri Lanka map | Delivered destination/pressure exploration without adding a tile-map dependency |
| PostGIS-based location handling | Numeric coordinates and Haversine distance in the service | Adequate for the small pilot destination set |
| Direct occupancy forecast | Residual LightGBM forecast reconstructed from prior occupancy | Performed better against the persistence baseline on the comparable 2024 holdout |
| Generic ML recommendation/scoring wording | Deterministic recommendation policy plus transparent Sustainability Index | Makes filtering/ranking auditable and avoids claiming an unvalidated learned recommender |
| Attraction-level overtourism wording | Regional occupancy pressure indicator | Matches the granularity of the available official SLTDA data |
| Climate-aware similarity | Landscape/activity cosine similarity, pressure, distance, and sustainability | Reliable destination-level climate fields were not available |
| Production security controls including rate limiting and HTTPS | Baseline application security only; deployment hardening deferred | Functional prototype scope and deadline; limitations are explicitly disclosed above |

The problem, target users, core solution, and proposed feature set remain aligned with the submitted proposal. All eight proposed product areas are represented in the prototype, while the operational items above remain future work.

## Open-source software, data, and media attribution

- Python and JavaScript dependencies are declared in `bk/requirements*.txt`, `ml/requirements.txt`, and `fr/package*.json`; their respective licenses apply.
- Tourism statistics: [Sri Lanka Tourism Development Authority annual statistical reports](https://www.sltda.gov.lk/en/annual-statistical-report).
- Weather data: [Open-Meteo](https://open-meteo.com/). Air-quality observations: [OpenAQ](https://openaq.org/). Map-related place data is compatible with [OpenStreetMap](https://www.openstreetmap.org/) attribution requirements, although the current schematic map does not load OSM tiles.
- Explainability is based on Lundberg and Lee, “A Unified Approach to Interpreting Model Predictions” (2017), and the open-source [SHAP](https://github.com/shap/shap) package.
- Bundled travel photographs retain their source filenames. Unsplash photographs are credited to [Andrei Alekseev](https://unsplash.com/photos/VVltlbkjMwQ), [Tomas Malik](https://unsplash.com/photos/6BQyHtYSb5E), and [Hendrik Cornelissen](https://unsplash.com/photos/svZvPZ54uBI) under the Unsplash License. Other bundled photographs are credited in their filenames to Pixabay contributors Poswiecie, Samantha Weerasinghe, and Musthaq SMS under the Pixabay Content License. The remote testimonial photographs are loaded from Unsplash.

## AI-assisted development disclosure

AI-assisted development tools were used during implementation and review. The team remains responsible for the design, source selection, code, tests, model interpretation, and all submission claims, and should be prepared to explain every component during judging.
