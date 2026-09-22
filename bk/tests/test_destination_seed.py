import json
from copy import deepcopy
from pathlib import Path

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.cli import seed_destinations as seed_module
from app.models.destination import Destination
from tests.test_destinations import EXAMPLE_DESTINATION


def test_load_and_seed_prepared_destination_json(
    tmp_path: Path,
    db_session: Session,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    seed_path = tmp_path / "prepared-destinations.json"
    payload = deepcopy(EXAMPLE_DESTINATION)
    seed_path.write_text(json.dumps([payload]), encoding="utf-8")

    class TestSessionContext:
        def __enter__(self) -> Session:
            return db_session

        def __exit__(self, *args: object) -> None:
            pass

    monkeypatch.setattr(seed_module, "SessionLocal", TestSessionContext)

    validated = seed_module.load_seed_file(seed_path)
    count = seed_module.seed_destinations(validated)

    stored = db_session.scalar(select(Destination))
    assert count == 1
    assert stored is not None
    assert stored.slug == EXAMPLE_DESTINATION["slug"]
    assert stored.factor is not None
    assert stored.factor.data_source == "Automated test fixture; not research data"
