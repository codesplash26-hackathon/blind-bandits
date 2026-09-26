# Demo destination seed

After the database migration, seed these destinations together with the local
demo administrator by running from `bk/`:

```bash
python -m app.cli.seed_demo
```

The administrator credentials are documented in the repository's main README.
The command is repeatable and skips destination slugs that already exist.

`destinations.json` contains the six non-personal destination records used by the hackathon demonstration environment. It is included only so judges can reproduce the application flow on a fresh database.

The sustainability factor values are explicitly marked `LOW` confidence and `PROXY`, and their `data_source` states that they are demo values. They are not research findings and must not be presented as measured destination conditions. Replace them with reviewed, cited values before any real-world use.
