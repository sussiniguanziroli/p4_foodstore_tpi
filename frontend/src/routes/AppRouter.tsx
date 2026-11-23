import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, RegisterPage, UnauthorizedPage } from '@/features/auth'
import { AdminCategoriasPage } from '@/features/categorias'
import { AdminPedidosPage, AdminResumenPage, CarritoPage, CheckoutPage, MisPedidosPage } from '@/features/pedidos'
import { AdminProductosPage, CatalogoPage } from '@/features/productos'
import { AdminUsuariosPage } from '@/features/usuarios'
import { AdminLayout } from '@/shared/layout/AdminLayout'
import { MainLayout } from '@/shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'

/** Tabla de rutas. Todas comparten MainLayout (Navbar + contenido). */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Con sesión (cualquier rol) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute rolesPermitidos={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/resumen" replace />} />
              <Route path="resumen" element={<AdminResumenPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="categorias" element={<AdminCategoriasPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
