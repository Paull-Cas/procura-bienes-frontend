export interface Bien {
  id_bien: number;
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface DetalleBien {
  id_detalle?: number;
  id_bien: number;
  id_requerimiento?: number;
  marca: string;
  unidad_medida: string;
  caracteristica_tecnica: string;
  cantidad: number;
  aplica_ficha_tecnica: boolean;
  ficha_tecnica?: string;
  aplica_certificado_calidad: boolean;
  certificado_calidad?: string;
}

export interface Requerimiento {
  id_requerimiento?: number;
  id_usuario: number;
  titulo: string;
  obra: string;
  tipo_requerimiento: string;
  estado?: string;
  descripcion: string;
  observaciones?: string;
  fecha_requerimiento?: string;
  fecha_maxima: string;
}


export interface RequerimientoCard {
  id_requerimiento: number,
  id_usuario: number,
  solicitante: string,
  titulo: string,
  obra: string,
  estado: string,
  fecha_requerimiento: string,
  fecha_maxima_abastecimiento: string
}