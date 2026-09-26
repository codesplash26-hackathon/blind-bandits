# SLTDA report extraction

This directory contains the official Sri Lanka Tourism Development Authority (SLTDA) PDF reports and reproducible, source-traceable CSV extracts used as inputs to later visitor-pressure modelling work. The pipeline performs raw extraction only; it does not train a model or create engineered features.

## Source PDFs

The repository currently stores the eight reports for 2017–2024 in `data/reports/`. The extractor first checks the intended `data/raw/reports/` path and then falls back to `data/reports/`, so the PDFs do not need to be moved or changed. Original PDFs are read-only inputs.

Seven reports contain usable embedded text. The 2019 report is image-only. Table 23 on PDF page 91 was therefore visually transcribed into a clearly marked fallback in the extractor. The raw extraction remains flagged because it is not programmatic. A later cell-by-cell visual review is recorded in `source_observation_reviews.csv`; that review corrected two prior Greater Colombo transcription errors (rooms `3,059` to `3,052`, and October `54.39` to `54.32`) without changing any unusual-but-correct source values.

## Generated files

- `data/processed/occupancy_raw.csv`: monthly occupancy rows where SLTDA publishes Jan–Dec data, plus annual-only rows where that is the only supported granularity.
- `data/processed/monthly_arrivals.csv`: national monthly tourist arrivals for 2017–2024.
- `data/processed/room_capacity.csv`: clearly reported regional or district room capacity.
- `data/processed/source_registry.csv`: report, table, PDF page, data type, and geography registry.
- `data/processed/extraction_audit.csv`: extracted, partial, not-found, and manual-review outcomes.
- `data/processed/geography_mapping.csv`: reviewable original-location to canonical-region configuration.
- `data/processed/source_observation_reviews.csv`: explicit 2019 and 2021 review decisions and source conflicts.
- `data/processed/arrival_reconciliation.csv`: the 2020 arrival-total discrepancy and later revision, stored without replacing the raw value.
- `data/processed/visitor_pressure_raw.csv`: cleaned, normalized, pre-feature-engineering monthly observations.
- `data/processed/model_candidate_rows.csv`: current training-eligible rows with a pandemic-period flag.
- `data/processed/normalization_summary.csv`: counts by candidate year, canonical region, and exclusion reason.
- `data/processed/canonical_region_month.csv`: one canonical occupancy target per year, month, and region.
- `data/processed/region_aggregation_audit.csv`: district contributors, capacity weights, exclusions, and warnings for each aggregation.
- `data/processed/visitor_pressure.csv`: ML-ready, leakage-safe feature dataset; no model has been fitted.
- `data/processed/evaluation_split_summary.csv`: proposed chronological experiment counts under alternative lag requirements.
- `data/processed/ml_dataset_summary.csv`: canonical row counts, occupancy statistics, missing features, and feature availability.

Blank CSV fields are source nulls. They are not zeroes and are never imputed. Percent occupancy remains on the report's 0–100 scale.

## Reporting and geography changes

The 2017–2019 monthly occupancy tables use resort regions. Only the seven top-level regions are included in the primary file: Colombo City, Greater Colombo, South Coast, East Coast, Hill Country, Ancient Cities, and Northern Region. Nested rows such as North of Colombo, Up to Galle, Kandy Area, and Habarana/Sigiriya/Dambulla are intentionally excluded to prevent parent/child double counting.

The 2020 and 2024 monthly occupancy tables use districts. The 2021 report provides annual district occupancy only, and its chart was visually transcribed and flagged because its narrative conflicts with some plotted labels. The 2022 and 2023 reports provide national annual graded occupancy but no monthly district table. The pipeline never expands annual values into months. Annual-only rows have blank `date`, `month`, and `occupancy_rate`; the source value appears only in `annual_occupancy_rate`.

Location spellings in room-capacity tables retain SLTDA report terminology, including report-specific variants such as `Ratnapura`/`Rathnapura`, `Moneragala`/`Monaragala`, `Puttalam`/`Puttlam`, and `Kaluthara`. The separate `geography_mapping.csv` layer creates reviewable canonical identifiers without silently changing the raw extraction.

## Geography normalization

`geography_mapping.csv` always preserves `original_location` and `original_location_type`. The 2017–2019 top-level resort-region rows map to themselves. District observations from 2020 and 2024 map only where the relationship to an SLTDA top-level region is defensible:

- Galle, Matara, and Hambantota → South Coast
- Ampara, Batticaloa, and Trincomalee → East Coast
- Nuwara Eliya and Badulla → Hill Country
- Kandy, Matale, Anuradhapura, and Polonnaruwa → Ancient Cities
- Jaffna, Kilinochchi, Mannar, Mullaitivu, and Vavuniya → Northern Region
- Gampaha and Kalutara → Greater Colombo, with medium confidence because district and resort-region boundaries are not identical

Colombo district is deliberately unresolved because one district observation cannot be defensibly split between Colombo City and Greater Colombo. Puttalam, Kurunegala, Kegalle, Ratnapura/Rathnapura, and Moneragala/Monaragala are also unresolved. Blank canonical regions are not guesses; they exclude those rows from `model_candidate_rows.csv` while retaining them in `visitor_pressure_raw.csv`.

## Pre-ML datasets

`visitor_pressure_raw.csv` contains only genuine monthly occupancy observations. It retains the original location alongside `canonical_region`, merges the national monthly-arrivals observation by year and month, and attaches same-year room capacity only when the original geography matches defensibly. It contains no lag, rolling, cyclical, growth, or other engineered features.

`model_candidate_rows.csv` is the stricter current eligibility view. A row must have a genuine non-null monthly occupancy target, a resolved canonical region, a valid month, and no unresolved review rejection. The file does not automatically exclude the pandemic: retained 2020 rows have `is_pandemic_period=true`. Final pandemic inclusion is intentionally deferred to later model experiments.

`visitor_pressure.csv` is the separate feature-engineered artifact. It does not replace or alter `visitor_pressure_raw.csv`.

## Canonical region-month aggregation

`canonical_region_month.csv` is the consistent modelling target table. It contains at most one row for each `year + month + canonical_region`.

For 2017–2019, the source already reports the seven top-level resort regions. Those observations are copied directly with `aggregation_method=source_resort_region`; nested subregions never enter the aggregation.

For 2020 and 2024, resolved districts are combined with room-weighted occupancy:

```text
regional occupancy = sum(district occupancy × district rooms) / sum(district rooms)
```

The 2020 calculation uses the room counts printed alongside monthly district occupancy because they correspond most closely to the tourist-hotel target population. The broader district inventory in `room_capacity.csv` is not substituted for those counts. The 2024 occupancy table reports hotel counts but not rooms, so the calculation uses the same-year Table 09 district room capacity from `room_capacity.csv`. The 2024 audit warns that Table 09 covers all registered accommodation while the occupancy target covers graded establishments. Hotel counts are never used as room weights.

Districts with a reported room count of zero receive zero weight rather than an invented equal weight. In 2020 this affects Kilinochchi and Mullaitivu in the Northern Region. A genuinely missing capacity would be excluded and would mark the regional result for manual review. The current canonical output has no missing-capacity review rows.

Unresolved district geography remains in `visitor_pressure_raw.csv` and outside the canonical dataset. The aggregation audit includes separate unresolved-geography records for every affected month. Colombo City has no district-derived 2020 or 2024 target because Colombo district cannot be defensibly divided between Colombo City and Greater Colombo.

## Feature engineering and calendar continuity

`visitor_pressure.csv` retains the canonical human-readable region and adds:

- cyclical month fields: `month_sin`, `month_cos`
- national arrivals: `arrivals_lag_1`, `arrivals_growth_1m`, and prior-only `arrivals_rolling_3`
- regional occupancy history: `occupancy_lag_1`, `occupancy_lag_2`, `occupancy_lag_3`, and prior-only `occupancy_rolling_3`
- availability flags for every occupancy-history feature and the national-arrival features
- `is_pandemic_period`, with 2020 retained rather than automatically excluded

Occupancy lags require an exact previous calendar month for the same canonical region. They never use the previous available row as a substitute. Consequently, January 2024 does not use December 2020, February 2024 may use January 2024 for lag 1, March may use January and February for lags 2 and 1, and April is the first 2024 month with three-month occupancy history.

National monthly arrivals genuinely exist for 2021–2023, so 2024 arrival-history features use those intervening source observations. This does not fabricate occupancy targets. All rolling features use prior months only; the current occupancy target is never included.

## Evaluation metadata

`evaluation_split_summary.csv` defines counts but does not choose or train a model:

- Experiment A: train 2017–2019, validate on pandemic year 2020, test 2024
- Experiment B: train 2017–2020, test 2024
- Experiment C: train 2017–2019, exclude 2020, test 2024

Each role is counted with no occupancy-history requirement, lag 1, lags 1–3, and rolling 3. The 2021–2023 occupancy gap is explicit in every test-period note. A later training pipeline must choose an experiment and decide whether current-month national arrivals are available at prediction time.

## Dataset layers

- `occupancy_raw.csv` preserves source geography and source granularity, including annual-only rows.
- `visitor_pressure_raw.csv` contains genuine monthly source observations, original locations, canonical mappings where resolved, and national arrivals.
- `canonical_region_month.csv` converts resolved observations to one consistent region-month target through direct use or documented room weighting.
- `visitor_pressure.csv` adds time and history features without overwriting any earlier layer.

## Re-run

Poppler's `pdftotext` and Python 3 are required. From the repository root:

```bash
python scripts/data_extraction/extract_sltda_reports.py
python scripts/data_extraction/build_visitor_pressure_dataset.py
python scripts/data_extraction/build_ml_dataset.py
python scripts/data_extraction/validate_extracted_data.py
python scripts/data_extraction/validate_visitor_pressure_data.py
python scripts/data_extraction/validate_ml_dataset.py
python -m pytest tests/data_extraction
```

Use `--report-dir` or `--output-dir` to override the defaults. The extraction command rewrites only the generated CSVs under `data/processed/`.

## Validation and known source issues

Validation checks occupancy ranges, month ranges, duplicate primary keys, negative capacities/arrivals, complete Jan–Dec groups when monthly data is published, reported annual values against simple monthly means, and the three supplied sanity-check rows.

The 2020 report prints monthly arrivals of 228,434, 207,507, 71,370, and zero for April–December, which sum to 507,311, while the same table prints an annual total of 507,704. The values are preserved exactly as printed. The 2021 report later shows 393 for December 2020, explaining the difference. `arrival_reconciliation.csv` stores the reported value (`0`), revised value (`393`), revision source, difference (`393`), and a `documented_not_applied_to_raw` status. The raw monthly value is not silently replaced.

The 2019 top-level rows have now been visually verified and are marked `verified_after_visual_review` in the normalized dataset. The 2021 Chart 08 annual district transcription remains unresolved: the plotted labels and narrative conflict, all raw values are preserved, and all 23 district review records remain flagged. These are annual-only observations and never become monthly training targets. The 2021–2023 reports contain no genuine monthly district occupancy table, so no target rows are generated for those years.
