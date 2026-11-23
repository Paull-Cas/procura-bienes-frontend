export interface Compra {
  idCompra?: number;
  idCotizacion?: number;
  idUsuario?: number;
  codigoOrdenCompra?: string;
  fechaCompra?: string;
  gestorCompra?: string;
  nombreEmpresa?: string;
  direccion?: string;
  ruc?: string;
  email?: string;
  formaPago?: string;
  plazoMinEntrega?: string;
  plazoMaxEntrega?: string;
  nota?: string;
  descuento?: number;
  precioSubtotal?: number;
  documentoCompra?: string; // contrato digital (base64, típicamente PDF)
  estado?: string;
}

export interface DetalleCompra {
  idDetalleCompra?: number;
  idDetalleCotizacion?: number;
  idCompra?: number;
  cantidadComprada?: number;
  precioCompra?: number;
  observaciones?: string;
}

// Oferta cotizada aceptada técnicamente que devuelve el comparativo de una procura
export interface OfertaCotizada {
  idDetalleCotizacion: number;
  idCotizacion: number;
  codigoCotizacion: string;
  idUsuario: number;
  proveedor: string;
  idDetalleRequerimiento: number;
  cantidad: number;
  precioUnitario: number;
  estado: string;
  moneda: string;
}
