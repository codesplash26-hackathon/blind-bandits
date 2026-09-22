from app.services.sustainability import SustainabilityResult


class DestinationSustainabilityResponse(SustainabilityResult):
    destination_id: int
    destination_slug: str

