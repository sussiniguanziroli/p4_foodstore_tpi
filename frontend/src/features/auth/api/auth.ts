import { api } from '@/shared/api/axiosInstance'
import type { Usuario, UsuarioCreate } from '@/features/usuarios'
import type { Credenciales, MensajeRespuesta } from '../types/auth'

/** POST /auth/token: formulario OAuth2 (x-www-form-urlencoded). La respuesta trae la cookie. */
export async function loginApi({ username, password }: Credenciales): Promise<MensajeRespuesta> {
  const { data } = await api.post<MensajeRespuesta>('/auth/token', new URLSearchParams({ username, password }))
  return data
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout')
}

/** GET /auth/me: el usuario de la cookie actual (401 si no hay sesión). */
export async function meApi(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function registerApi(datos: UsuarioCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', datos)
  return data
}
