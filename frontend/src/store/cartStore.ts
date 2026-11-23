import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** Ítem del carrito. El precio se guarda para mostrar el subtotal; el que cobra es el del servidor. */
export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: CartItem[]
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void
  quitar: (producto_id: number) => void
  cambiarCantidad: (producto_id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Si el producto ya está en el carrito, suma la cantidad (así no se repite: RN-01)
      agregar: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, cantidad }] }
        }),

      quitar: (producto_id) => set((state) => ({ items: state.items.filter((i) => i.producto_id !== producto_id) })),

      // Una cantidad menor que 1 quita el producto
      cambiarCantidad: (producto_id, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((i) => i.producto_id !== producto_id)
              : state.items.map((i) => (i.producto_id === producto_id ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: 'foodstore-carrito', // clave en localStorage: el carrito sobrevive a la recarga
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
