import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

/** Estructura común de todas las pantallas: Navbar arriba y el contenido de la ruta (Outlet). */
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        Food Store · TPI Programación IV · TUPaD UTN · Patricio Sussini Guanziroli
      </footer>
    </div>
  )
}
