
export interface Usuario {
  id_usuario?: number;
  nombre_usuario: string;
  alias: string;
  email: string;
  estado: 1 | 0;
  ultimo_log?: string | null;
  id_rol?: number;
  contrasena?: string | null;
}

export interface Permiso {
  id_permiso?: number;
  codigo_permiso: string;
  nombre: string;
  descripcion: string;
  id_modulo?: number;
}

export interface Modulo {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  ruta: string | null;
  icono: string;
  dependencia: number | null;
}

export interface RolPermiso {
  id_rol_permiso?: number;
  id_permiso?: number;
  id_rol?: number;
}

export interface Rol {
  id_rol?: number;
  nombre: string;
  descripcion: string;
  estado: 1 | 0;
}

export interface RolConPermisos {
  rol: Rol;
  permisos : Permiso[];
}