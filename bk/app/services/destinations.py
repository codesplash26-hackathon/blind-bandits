from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.destination import Activity, Destination, DestinationFactor
from app.schemas.destination import DestinationCreate, DestinationFactorInput


def destination_load_options() -> tuple[object, ...]:
    return (
        selectinload(Destination.activities),
        selectinload(Destination.factor),
    )


def get_destination_by_id(db: Session, destination_id: int) -> Destination | None:
    statement = (
        select(Destination)
        .where(Destination.id == destination_id)
        .options(*destination_load_options())
    )
    return db.scalar(statement)


def get_destination_by_identifier(
    db: Session,
    identifier: str,
    *,
    active_only: bool = True,
) -> Destination | None:
    condition = (
        Destination.id == int(identifier)
        if identifier.isdigit()
        else Destination.slug == identifier
    )

    statement = select(Destination).where(condition)
    if active_only:
        statement = statement.where(Destination.is_active.is_(True))
    statement = statement.options(*destination_load_options())
    return db.scalar(statement)


def find_destination_by_slug(db: Session, slug: str) -> Destination | None:
    return db.scalar(select(Destination).where(Destination.slug == slug))


def resolve_activities(db: Session, slugs: list[str]) -> list[Activity]:
    if not slugs:
        return []
    existing = {
        activity.slug: activity
        for activity in db.scalars(select(Activity).where(Activity.slug.in_(slugs)))
    }
    return [
        existing.get(slug) or Activity(slug=slug, name=slug.replace("-", " ").title())
        for slug in slugs
    ]


def build_factor(data: DestinationFactorInput) -> DestinationFactor:
    return DestinationFactor(**data.model_dump())


def create_destination(
    db: Session,
    data: DestinationCreate,
) -> Destination:
    values = data.model_dump(exclude={"activities", "factor"})
    destination = Destination(**values)
    destination.activities = resolve_activities(db, data.activities)
    if data.factor is not None:
        destination.factor = build_factor(data.factor)
    db.add(destination)
    return destination


def replace_factor(
    destination: Destination,
    data: DestinationFactorInput,
) -> None:
    if destination.factor is None:
        destination.factor = build_factor(data)
        return
    for field, value in data.model_dump().items():
        setattr(destination.factor, field, value)
