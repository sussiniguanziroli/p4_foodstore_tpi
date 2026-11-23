from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración de la aplicación, leída de variables de entorno o del archivo .env.

    Los secretos (DATABASE_URL con su contraseña y SECRET_KEY) no tienen valor por defecto:
    si faltan, la aplicación no arranca (fail-fast) en lugar de usar una clave conocida.
    """

    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Uno o varios orígenes separados por coma (CORS con credenciales no admite "*")
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    # En producción (HTTPS) se pone en true para que la cookie viaje solo cifrada
    COOKIE_SECURE: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def frontend_origins(self) -> list[str]:
        return [origen.strip() for origen in self.FRONTEND_ORIGIN.split(",") if origen.strip()]


settings = Settings()  # type: ignore[call-arg]  # los valores llegan desde el entorno

# Nombre de la cookie HttpOnly que transporta el JWT
COOKIE_NAME = "access_token"
