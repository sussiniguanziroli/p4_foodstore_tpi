// API pública de la feature auth (barrel). Otras partes de la app importan solo desde acá.
export { LoginPage } from './pages/LoginPage'
export { RegisterPage } from './pages/RegisterPage'
export { UnauthorizedPage } from './pages/UnauthorizedPage'
export { loginApi, logoutApi, meApi } from './api/auth'
export type { Credenciales } from './types/auth'
