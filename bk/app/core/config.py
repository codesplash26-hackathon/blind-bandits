from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.schemas.pressure import PressureBandThresholds
from app.services.sustainability import SustainabilityWeightConfiguration
from app.services.what_if import SimulationPolicy


class Settings(BaseSettings):
    app_name: str = "CeylonTour API"
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        validation_alias="CORS_ORIGINS",
    )
    database_url: str = Field(validation_alias="DATABASE_URL")
    jwt_secret_key: str = Field(min_length=32, validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30,
        gt=0,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    sustainability_weights: SustainabilityWeightConfiguration = Field(
        validation_alias="SUSTAINABILITY_WEIGHTS"
    )
    pressure_model_artifact_dir: Path = Field(
        default=Path("artifacts/visitor_pressure"),
        validation_alias="PRESSURE_MODEL_ARTIFACT_DIR",
    )
    pressure_band_thresholds: PressureBandThresholds | None = Field(
        default=None,
        validation_alias="PRESSURE_BAND_THRESHOLDS",
    )
    simulation_policy: SimulationPolicy | None = Field(
        default=None,
        validation_alias="SIMULATION_POLICY",
    )
    open_meteo_url: str = Field(
        default="https://api.open-meteo.com/v1/forecast",
        validation_alias="OPEN_METEO_URL",
    )
    open_meteo_api_key: SecretStr | None = Field(
        default=None, validation_alias="OPEN_METEO_API_KEY"
    )
    openaq_url: str = Field(
        default="https://api.openaq.org/v3", validation_alias="OPENAQ_URL"
    )
    openaq_api_key: SecretStr | None = Field(
        default=None, validation_alias="OPENAQ_API_KEY"
    )
    openaq_radius_m: int = Field(
        default=25000, gt=0, le=25000, validation_alias="OPENAQ_RADIUS_M"
    )
    environment_stale_after_minutes: int = Field(
        default=180, gt=0, validation_alias="ENVIRONMENT_STALE_AFTER_MINUTES"
    )
    environment_http_timeout_seconds: float = Field(
        default=10.0, gt=0, validation_alias="ENVIRONMENT_HTTP_TIMEOUT_SECONDS"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
