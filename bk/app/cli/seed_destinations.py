import argparse
import json
from pathlib import Path
from typing import Any

from pydantic import TypeAdapter
from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.schemas.destination import DestinationCreate
from app.services.destinations import create_destination, find_destination_by_slug

destination_list_adapter = TypeAdapter(list[DestinationCreate])


def load_seed_file(path: Path) -> list[DestinationCreate]:
    with path.open(encoding="utf-8") as seed_file:
        raw_data: Any = json.load(seed_file)
    return destination_list_adapter.validate_python(raw_data)


def seed_destinations(destinations: list[DestinationCreate]) -> int:
    with SessionLocal() as db:
        try:
            for data in destinations:
                if find_destination_by_slug(db, data.slug) is not None:
                    raise ValueError(
                        f"A destination with slug '{data.slug}' already exists"
                    )
                create_destination(db, data)
                db.flush()
            db.commit()
        except (IntegrityError, ValueError):
            db.rollback()
            raise
    return len(destinations)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import prepared destination research data from JSON"
    )
    parser.add_argument(
        "--input",
        type=Path,
        required=True,
        help="Path to a reviewed JSON array of destination records",
    )
    args = parser.parse_args()
    try:
        destinations = load_seed_file(args.input)
        count = seed_destinations(destinations)
    except (IntegrityError, OSError, ValueError) as exc:
        parser.error(str(exc))
    print(f"Seeded {count} destinations")


if __name__ == "__main__":
    main()
