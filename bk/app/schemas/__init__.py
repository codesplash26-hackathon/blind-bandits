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

__all__ = [
    "CurrentUserResponse",
    "DestinationCreate",
    "DestinationFactorInput",
    "DestinationFactorResponse",
    "DestinationResponse",
    "DestinationUpdate",
    "LoginRequest",
    "RegistrationRequest",
    "TokenResponse",
]
