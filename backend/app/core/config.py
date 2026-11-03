from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://kubex:kubex_password@localhost:5432/kubex_db"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    frontend_url: str = "http://localhost:5173"

    # $0.10 per GB per month, close to what GPU marketplaces charge for disk.
    storage_rate_per_gb_month_cents: int = 10


settings = Settings()
