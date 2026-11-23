// Mismos nombres de campo que los schemas del backend (app/modules/pedidos/schemas.py)

export const ESTADOS_PEDIDO = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'] as const
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number]

export const FORMAS_PAGO = ['EFECTIVO', 'TRANSFERENCIA'] as const
export type FormaPago = (typeof FORMAS_PAGO)[number]

/** DetallePedidoRead: línea con la copia del nombre y del precio del producto. */
export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

/** PedidoRead */
export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

/** PedidosPaginados */
export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

/** PedidoCreate: el cliente envía solo producto y cantidad; precios y total los calcula el servidor. */
export interface PedidoCreate {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

/** ResumenPedidos: indicadores del panel de administración. */
export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

/** Parámetros de GET /pedidos */
export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

/** Máquina de estados (misma tabla que el backend): a qué estados puede pasar el admin. */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}
