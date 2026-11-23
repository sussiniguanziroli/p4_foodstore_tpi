/** Respuesta de POST /auth/token y POST /auth/logout. El token NO viene acá: viaja en la cookie. */
export interface MensajeRespuesta {
  message: string
}

export interface Credenciales {
  username: string
  password: string
}
