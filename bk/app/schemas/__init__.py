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
from app.schemas.sustainability import DestinationSustainabilityResponse

__all__ = [
    "CurrentUserResponse",
    "DestinationCreate",
    "DestinationFactorInput",
    "DestinationFactorResponse",
    "DestinationResponse",
    "DestinationSustainabilityResponse",
    "DestinationUpdate",
    "LoginRequest",
    "RegistrationRequest",
    "TokenResponse",
]
