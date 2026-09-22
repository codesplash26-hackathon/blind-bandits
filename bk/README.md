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
