import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types/categoria'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function createCategoria(datos: CategoriaInput): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', datos)
  return data
}

export async function updateCategoria(id: number, datos: Partial<CategoriaInput>): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

/** Baja lógica: responde 204 sin cuerpo. */
export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
