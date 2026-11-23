// Mismos nombres de campo que los schemas del backend (app/modules/usuarios/schemas.py)

export type Rol = 'user' | 'admin'

/** UserPublic: lo que la API expone de un usuario (nunca la contraseña). */
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

/** UserCreate: cuerpo de POST /auth/register. */
export interface UsuarioCreate {
  username: string
  full_name: string
  email: string
  password: string
}
