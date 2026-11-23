import type { Categoria } from '@/features/categorias'

// Mismos nombres de campo que los schemas del backend (app/modules/productos/schemas.py)

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria_id: number
  categoria: Categoria
}

/** ProductoCreate / ProductoUpdate */
export interface ProductoInput {
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}

/** ProductoStockUpdate: cuerpo de PATCH /productos/{id}/stock */
export interface ProductoStockUpdate {
  stock: number
  disponible: boolean
}

/** ProductosPaginados */
export interface ProductosPaginados {
  total: number
  items: Producto[]
}

/** Parámetros de GET /productos */
export interface FiltrosProductos {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
