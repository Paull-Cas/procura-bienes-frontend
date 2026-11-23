
export interface Factura {
  id_factura?: number;
  titulo?: string;
  id_usuario?: number;
  nombre_usuario?: string;
  id_orden_operativa?: number;
  fecha_emision: string;
  fecha_carga?: string;
  fecha_limite: string;
  monto_total: number;
  monto_pagado?: number;
  moneda: string;
  estado_factura?: string;
  factura_file: string;
  descripcion?: string;
  observacion?: string;
  porcentaje_detraccion?: number;
}

export interface Pago {
  id_pago?: number;
  titulo?: string;
  id_factura: number;
  monto_pago: number;
  tipo_pago: string;
  fecha_pago: string;
  fecha_carga?: string;
  proximo_pago_estimado: string;
  comprobante_file: string;
  descripcion?: string;
}
