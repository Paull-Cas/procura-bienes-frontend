import { API_BASE } from "../../../api_base";
import { getToken } from "../../../api_base";
import { Permiso, RolConPermisos, Rol, Usuario } from "../data/models";

export const createUsuario = async (usuario: Usuario) => {
  const payload = {
    nombreUsuario: usuario.nombre_usuario,
    alias: usuario.alias,
    email: usuario.email,
    estado: usuario.estado,
    idRol: usuario.id_rol || null,
    contrasena: usuario.contrasena || null,
  };
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Error al crear el usuario");
    }

    return true;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return false;
  }
};

export const fetchUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE}/usuario/todos`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();
    return data.object.map((usuario: any) => ({
      id_usuario: usuario.idUsuario,
      alias: usuario.alias,
      nombre_usuario: usuario.nombreUsuario,
      email: usuario.email,
      estado: usuario.estado,
      ultimo_log: usuario.ultimoLog,
      id_rol: usuario.idRol,
    }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};

export const fetchUsuarioById = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE}/usuario/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      throw new Error("Error al obtener usuario");
    }
    const data = await response.json();
    const obj = data.object;
    return {
      id_usuario: obj.idUsuario,
      alias: obj.alias,
      nombre_usuario: obj.nombreUsuario,
      email: obj.email,
      estado: obj.estado,
      ultimo_log: obj.ultimoLog,
      id_rol: obj.idRol,
    };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
};

export const updateUsuario = async (id: number, usuario: Usuario) => {
  const payload = {
    nombreUsuario: usuario.nombre_usuario,
    alias: usuario.alias,
    email: usuario.email,
    estado: usuario.estado,
    idRol: usuario.id_rol || null
  };
  try {
    const response = await fetch(`${API_BASE}/usuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el usuario");
    }

    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return false;
  }
};

export const deleteUsuario = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE}/usuario/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el usuario");
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return false;
  }
};

export const fetchPermisos = async () => {
  try {
    const response = await fetch(`${API_BASE}/permisos/todos`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();

    return data.object.map(
      (permiso: any): Permiso => ({
        id_permiso: permiso.idPermiso,
        codigo_permiso: permiso.codigoPermiso,
        nombre: permiso.nombre,
        descripcion: permiso.descripcion,
        id_modulo: permiso.idModulo,
      })
    );
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return [];
  }
};

export const fetchModulos = async () => {
  try {
    const response = await fetch(`${API_BASE}/modulos/todos`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();
    const allModulos = data.object;

    return allModulos.map((modulo: any) => ({
      id_modulo: modulo.idModulo,
      nombre: modulo.nombre,
      descripcion: modulo.descripcion,
      ruta: modulo.ruta,
      icono: modulo.icono,
      dependencia: modulo.dependencia,
    }));
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    return [];
  }
};

export const createRol = async (rol: Rol, permisos: number[]) => {
  try {
    const response = await fetch(`${API_BASE}/roles/guardar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        rolRequest: { ...rol },
        permisosRequest: permisos,
      }),
    });
    if (!response.ok) {
      throw new Error("Error al crear el rol");
    }

    return true;
  } catch (error) {
    console.error("Error al crear rol:", error);
    return false;
  }
};

export const fetchRolconPermisos = async () => {
  try {
    const response = await fetch(`${API_BASE}/rolesypermisos/todos`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();
    return data.object.map(
      (rol: any): RolConPermisos => ({
        rol: {
          id_rol: rol.rolResponse.idRol,
          nombre: rol.rolResponse.nombre,
          descripcion: rol.rolResponse.descripcion,
          estado: rol.rolResponse.estado,
        },
        permisos: rol.permisosResponse.map((permiso: any) => ({
          id_permiso: permiso.idPermiso,
          nombre: permiso.nombre,
          descripcion: permiso.descripcion,
          id_modulo: permiso.idModulo,
        })),
      })
    );
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return [];
  }
};

export const fetchRoles = async () => {
  try {
    const response = await fetch(`${API_BASE}/roles/todos`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();
    return data.object.map((rol: any) => ({
      id_rol: rol.idRol,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      estado: rol.estado,
    }));
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return [];
  }
};

export const updateRol = async (id: number, rol: Rol, permisos: number[]) => {
  try {
    const response = await fetch(`${API_BASE}/roles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        rolRequest: { ...rol },
        permisosRequest: permisos,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el rol");
    }

    return true;
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return false;
  }
};

export const deleteRol = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE}/roles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el rol");
    }
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    throw error;
  }
};
