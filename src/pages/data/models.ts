
export interface FileData {
  data: Uint8Array;
  type: string;
  fileName: string;
}

export interface UsuarioProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  permisos: {
    nombre: string;
    codigoPermiso: string;
    descripcion: string;
  }[];
}


export interface Modulo {
  idModulo: number;
  nombre: string;
  descripcion: string;
  ruta: string | null;
  icono: string;
  dependencia: number | null;
}



