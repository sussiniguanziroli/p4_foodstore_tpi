from sqlmodel import SQLModel

# El registro usa UserCreate y responde UserPublic (definidos en usuarios/schemas.py,
# porque describen al modelo Usuario). Acá quedan los schemas propios de auth.


class MensajeRead(SQLModel):
    """Respuesta del login y del logout. El token NUNCA va en el cuerpo: viaja en la cookie."""

    message: str
