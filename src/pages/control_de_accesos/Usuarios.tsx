import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, UserCheck, UserX, Edit, Trash2 } from "lucide-react";
import {
  fetchUsuarios,
  fetchRoles,
  updateUsuario,
  deleteUsuario,
} from "./data/api";
import { Rol } from "./data/models";
import Confirmacion from "../components/Confirmacion";
import Toast from "../components/Toast";
import { UsuarioProfile } from "../data/models";
import { Usuario } from "./data/models";
import CreateUsuarioModal from "./components/CreateUsuarioModal";
import UpdateUsuarioModal from "./components/UpdateUsuarioModal";

interface UsuarioData {
  id_usuario: number;
  nombre_usuario: string;
  alias: string;
  email: string;
  estado: 0 | 1;
  ultimo_log?: string;
  rol?: Rol | null;
}

interface UsuariosProps {
  user: UsuarioProfile;
}

export default function Usuarios({ user }: UsuariosProps) {
  // Estados
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<UsuarioData | null>(null);

  // Estados para confirmación y toast
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<UsuarioData | null>(
    null
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Estados para confirmación de cambio de estado
  const [showStatusConfirmacion, setShowStatusConfirmacion] = useState(false);
  const [usuarioToToggle, setUsuarioToToggle] = useState<UsuarioData | null>(
    null
  );

  // Permisos del usuario
  const [permisos, setPermisos] = useState<string[]>([]);

  useEffect(() => {
    setPermisos(user.permisos.map((p) => p.codigoPermiso));
    loadData();
  }, [user]);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Memorized permissions
  const permisoCrear = useMemo(
    () => permisos.includes("USR_CREATE"),
    [permisos]
  );

  const permisoActualizar = useMemo(
    () => permisos.includes("USR_UPDATE"),
    [permisos]
  );

  const permisoEliminar = useMemo(
    () => permisos.includes("USR_DELETE"),
    [permisos]
  );

  const permisoCambiarEstado = useMemo(
    () => permisos.includes("USR_UPDATE"),
    [permisos]
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const [usuariosData, rolesData] = await Promise.all([
        fetchUsuarios(),
        fetchRoles(),
      ]);

      setUsuarios(
        usuariosData.map((usuario: any) => ({
          ...usuario,
          estado: usuario.estado as 0 | 1,
          rol: usuario.id_rol
            ? rolesData.find((r: Rol) => r.id_rol === usuario.id_rol)
            : null,
        }))
      );

      setRoles(rolesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setToastMessage("Error al cargar los datos");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredUsers = usuarios.filter((user) => {
    const matchesSearch =
      user.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.estado === 1) ||
      (filterStatus === "inactive" && user.estado === 0);
    return matchesSearch && matchesStatus;
  });

  const confirmToggleUsuarioStatus = async () => {
    if (usuarioToToggle) {
      try {
        setLoading(true);
        setShowStatusConfirmacion(false);

        const updatedUsuario: UsuarioData = {
          ...usuarioToToggle,
          estado: usuarioToToggle.estado === 1 ? 0 : 1,
        };

        const apiUsuario: Usuario = {
          nombre_usuario: updatedUsuario.nombre_usuario,
          alias: updatedUsuario.alias,
          email: updatedUsuario.email,
          estado: updatedUsuario.estado,
          id_rol: updatedUsuario.rol!.id_rol,
        };

        const success = await updateUsuario(
          updatedUsuario.id_usuario,
          apiUsuario
        );

        if (success) {
          const action =
            updatedUsuario.estado === 1 ? "activado" : "desactivado";
          setToastMessage(`¡Usuario ${action} exitosamente!`);
          setToastType("success");
          setShowToast(true);

          loadData();
        } else {
          setToastMessage("Error al cambiar el estado del usuario");
          setToastType("error");
          setShowToast(true);
        }

        setUsuarioToToggle(null);
      } catch (error) {
        console.error("Error al cambiar estado del usuario:", error);
        setToastMessage("Error al cambiar el estado del usuario");
        setToastType("error");
        setShowToast(true);
        setShowStatusConfirmacion(false);
        setUsuarioToToggle(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUsuario = async () => {
    if (usuarioToDelete) {
      try {
        setLoading(true);
        setShowConfirmacion(false);

        const success = await deleteUsuario(usuarioToDelete.id_usuario);

        if (success !== false) {
          setToastMessage("¡Usuario eliminado exitosamente!");
          setToastType("success");
          setShowToast(true);

          loadData();
        } else {
          setToastMessage("Error al eliminar el usuario");
          setToastType("error");
          setShowToast(true);
        }

        setUsuarioToDelete(null);
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        setToastMessage("Error al eliminar el usuario");
        setToastType("error");
        setShowToast(true);
        setShowConfirmacion(false);
        setUsuarioToDelete(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (usuario: UsuarioData) => {
    setUsuarioToEdit(usuario);
    setShowUpdateModal(true);
  };

  const startToggleStatus = (usuario: UsuarioData) => {
    setUsuarioToToggle(usuario);
    setShowStatusConfirmacion(true);
  };

  const startDelete = (usuario: UsuarioData) => {
    setUsuarioToDelete(usuario);
    setShowConfirmacion(true);
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Usuarios
        </h1>
        {permisoCrear && (
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="
    group relative
    bg-gradient-to-r from-blue-600 to-blue-700 
    hover:from-blue-700 hover:to-blue-800 
    active:from-blue-800 active:to-blue-900
    text-white font-medium
    px-2 py-3 
    rounded-xl 
    flex items-center justify-center gap-2 
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
    shadow-lg hover:shadow-xl
    disabled:opacity-50 disabled:cursor-not-allowed 
    disabled:hover:scale-100 disabled:shadow-lg
    min-w-[120px] sm:min-w-[140px]
    text-sm sm:text-base
    focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
  "
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" />
            <span className="hidden xs:inline sm:inline">Nuevo Usuario</span>
            <span className="inline xs:hidden sm:hidden">Nuevo</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los usuarios</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((usuario) => (
                  <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre_usuario}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {usuario.alias}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {usuario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {usuario.rol?.nombre || "Sin rol"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.estado === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usuario.ultimo_log
                        ? new Date(usuario.ultimo_log).toLocaleDateString(
                            "es-ES"
                          )
                        : "Nunca"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        {permisoCambiarEstado && (
                          <button
                            onClick={() => startToggleStatus(usuario)}
                            disabled={loading}
                            className={`p-1 rounded transition-colors disabled:opacity-50 ${
                              usuario.estado === 1
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={
                              usuario.estado === 1 ? "Desactivar" : "Activar"
                            }
                          >
                            {usuario.estado === 1 ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {permisoActualizar && (
                          <button
                            onClick={() => startEdit(usuario)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {permisoEliminar && (
                          <button
                            onClick={() => startDelete(usuario)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {loading
                      ? "Cargando usuarios..."
                      : "No se encontraron usuarios que coincidan con la búsqueda"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación para eliminar usuario */}
      <Confirmacion
        isOpen={showConfirmacion}
        onClose={() => {
          setShowConfirmacion(false);
          setUsuarioToDelete(null);
        }}
        onConfirm={handleDeleteUsuario}
        title="Confirmar eliminación"
        message={`¿Estás seguro que deseas eliminar al usuario "${usuarioToDelete?.nombre_usuario}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <Confirmacion
        isOpen={showStatusConfirmacion}
        onClose={() => {
          setShowStatusConfirmacion(false);
          setUsuarioToToggle(null);
        }}
        onConfirm={confirmToggleUsuarioStatus}
        title="Confirmar cambio de estado"
        message={`¿Estás seguro que deseas ${
          usuarioToToggle?.estado === 1 ? "desactivar" : "activar"
        } al usuario "${usuarioToToggle?.nombre_usuario}"?`}
        confirmText={usuarioToToggle?.estado === 1 ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={3000}
        />
      )}

      {permisoCrear && (
        <CreateUsuarioModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={loadData}
          roles={roles.filter((r) => r.estado === 1)}
        />
      )}

      {usuarioToEdit && permisoActualizar && (
        <UpdateUsuarioModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setUsuarioToEdit(null);
          }}
          onUsuarioUpdated={loadData}
          usuario={usuarioToEdit}
          roles={roles.filter((r) => r.estado === 1)}
        />
      )}
    </div>
  );
}
