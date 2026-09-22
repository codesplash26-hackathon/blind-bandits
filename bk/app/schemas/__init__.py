from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    RegistrationRequest,
    TokenResponse,
)
from app.schemas.destination import (
    DestinationCreate,
    DestinationFactorInput,
    DestinationFactorResponse,
    DestinationResponse,
    DestinationUpdate,
)
from app.schemas.recommendation import (
    CrowdPreference,
    PreferenceMatchResponse,
    RecommendationItemResponse,
    RecommendationRequest,
    RecommendationResponse,
    SustainabilityPreference,
)
from app.schemas.sustainability import DestinationSustainabilityResponse

__all__ = [
    "CrowdPreference",
    "CurrentUserResponse",
    "DestinationCreate",
    "DestinationFactorInput",
    "DestinationFactorResponse",
    "DestinationResponse",
    "DestinationSustainabilityResponse",
    "DestinationUpdate",
    "LoginRequest",
    "PreferenceMatchResponse",
    "RecommendationItemResponse",
    "RecommendationRequest",
    "RecommendationResponse",
    "RegistrationRequest",
    "SustainabilityPreference",
    "TokenResponse",
]
