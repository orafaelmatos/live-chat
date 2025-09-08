from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "change_me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"


    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"


    PROMETHEUS_ENABLED: bool = True


    class Config:
        env_file = ".env"


settings = Settings()