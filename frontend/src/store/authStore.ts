import { isAxiosError } from 'axios'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { loginApi, logoutApi, meApi } from '@/features/auth'
import type { Usuario } from '@/features/usuarios'
import { queryClient } from '@/shared/api/queryClient'

interface AuthState {
  /** Usuario de la sesión (id, nombre, email y rol). Nunca el token: ese vive en la cookie HttpOnly. */
  usuario: Usuario | null
  /** true mientras checkSession confirma la sesión con el backend. */
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  /** La usa el interceptor de Axios cuando la sesión deja de ser válida (401 / cuenta desactivada). */
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginApi({ username, password }) // el backend responde con la cookie access_token
        const usuario = await meApi() // los datos del usuario se piden aparte: el token no se lee
        set({ usuario, cargando: false })
      },

      logout: async () => {
        try {
          await logoutApi() // el backend borra la cookie
        } finally {
          get().limpiarSesion()
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await meApi()
          set({ usuario, cargando: false })
        } catch (error) {
          // 401 (sin cookie o vencida) o 400 (cuenta desactivada): la sesión no sirve.
          // Si el servidor no responde, se conserva el usuario guardado y se reintenta en la próxima carga.
          if (isAxiosError(error) && error.response) set({ usuario: null })
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false })
        queryClient.clear() // no quedan en caché datos de la sesión anterior
      },
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      // partialize: solo se persiste el usuario (para pintar la Navbar al recargar). Nunca el token.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
