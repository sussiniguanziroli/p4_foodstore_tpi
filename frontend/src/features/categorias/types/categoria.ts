// Mismos nombres de campo que los schemas del backend (app/modules/categorias/schemas.py)

export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

/** CategoriaCreate / CategoriaUpdate */
export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}
