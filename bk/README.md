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
