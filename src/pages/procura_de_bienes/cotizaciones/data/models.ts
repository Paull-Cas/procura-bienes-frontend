export interface Cotizacion {
  idCotizacion?: number;
  idProcura?: number;
  idUsuario?: number;
  codigoCotizacion?: string;
  numeroCotizacion?: string;
  servicioOfertado?: string;
  moneda?: string;
  garantia?: string;
  formaPago?: string;
  plazoMinEntrega?: string;
  plazoMaxEntrega?: string;
  notas?: string;
  informacionPago?: string;
  documentoCotizacion?: string;
  fechaCotizacion?: string;
  fechaLimiteCompra?: string;
  estado?: string;
  precioSubtotal?: number;
  personaContacto?: string;
  telefonoMovil?: string;
  telefonoOficina?: string;
  email?: string;
  incluyeIgv: boolean;
  incluyeCostosTransporte: boolean;
  costosTransporte?: number;
}

export interface DetalleCotizacion {
  idDetalleCotizacion?: number;
  idCotizacion?: number;
  idDetalleRequerimiento?: number;
  cantidad?: number;
  precioUnitario?: number;
  estado?: string;
  fichaTecnica?: string;
  brindaCertificadoCalidad?: boolean;
}