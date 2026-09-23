from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.schemas.pressure import PressureBandThresholds
from app.services.sustainability import SustainabilityWeightConfiguration
from app.services.what_if import SimulationPolicy


class Settings(BaseSettings):
    app_name: str = "CeylonTour API"
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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
