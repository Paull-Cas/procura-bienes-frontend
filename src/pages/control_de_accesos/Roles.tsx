import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Shield } from "lucide-react";
import { RolConPermisos } from "./data/models";
import { fetchRolconPermisos, deleteRol } from "./data/api";
import { UsuarioProfile } from "../data/models";
import Confirmacion from "../components/Confirmacion";
import Toast from "../components/Toast";
import CreateRoleModal from "./components/CreateRolModal";
import UpdateRolModal from "./components/UpdateRolModal";

interface RolesProps {
  user: UsuarioProfile;
}

export default function Roles({ user }: RolesProps) {
  const [rolesConPermisos, setRolesConPermisos] = useState<RolConPermisos[]>(
    []
  );

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RolConPermisos | null>(null);

  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RolConPermisos | null>(null);

  // Estados para Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [permisos, setPermisos] = useState<string[]>([]);

  useEffect(() => {
    setPermisos(user.permisos.map((p) => p.codigoPermiso));
    loadRoles();
  }, []);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const permisoCrear = useMemo(
    () => permisos.includes("ROL_CREATE"),
    [permisos]
  );

  const permisoActualizar = useMemo(
    () => permisos.includes("ROL_UPDATE"),
    [permisos]
  );

  const permisoEliminar = useMemo(
    () => permisos.includes("ROL_DELETE"),
    [permisos]
  );

  const loadRoles = async () => {
    setLoading(true);
    try {
      const rolesData = await fetchRolconPermisos();
      setRolesConPermisos(rolesData);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = rolesConPermisos.filter(
    (rolyPermisos: any) =>
      rolyPermisos.rol.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rolyPermisos.rol.descripcion
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleDeleteRol = async (id: number) => {
    if (roleToDelete) {
      setLoading(true);
      try {
        setShowConfirmacion(false);

        await deleteRol(id);

        setRoleToDelete(null);

        setToastMessage("¡Rol eliminado exitosamente!");
        setToastType("success");
        setShowToast(true);

        loadRoles();
      } catch (error) {
        console.error("Error al eliminar rol:", error);
        setToastMessage("Error al eliminar el rol");
        setToastType("error");
        setShowToast(true);

        setShowConfirmacion(false);
        setRoleToDelete(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (rol: RolConPermisos) => {
    setRoleToEdit(rol);
    setShowUpdateModal(true);
  };

  if (loading && rolesConPermisos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando roles...</div>
      </div>
    );
  }

  return (
    <div className="bg-white-100 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles</h1>
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
    px-1 py-3 
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
            <span className="hidden xs:inline sm:inline">Nuevo Rol</span>
            <span className="inline xs:hidden sm:hidden">Nuevo</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((rol) => (
          <div
            key={rol.rol.id_rol}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {rol.rol.nombre}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rol.rol.estado === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rol.rol.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {permisoActualizar && (
                  <button
                    onClick={() => startEdit(rol)}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {permisoEliminar && (
                  <button
                    onClick={() => {
                      setRoleToDelete(rol);
                      setShowConfirmacion(true);
                    }}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{rol.rol.descripcion}</p>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Permisos ({rol.permisos.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {rol.permisos.map((permiso) => (
                  <div
                    key={permiso.id_permiso}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <span className="text-xs text-gray-500">
                      {permiso.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Confirmacion
        isOpen={showConfirmacion}
        onClose={() => {
          setShowConfirmacion(false);
          setRoleToDelete(null);
        }}
        onConfirm={() => handleDeleteRol(roleToDelete?.rol.id_rol!)}
        title="Confirmar eliminación"
        message={`¿Estás seguro que deseas eliminar el rol "${roleToDelete?.rol.nombre}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={1000}
        />
      )}

      {permisoCrear && (
        <CreateRoleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onRoleCreated={loadRoles}
        />
      )}
      {roleToEdit && permisoActualizar && (
        <UpdateRolModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setRoleToEdit(null);
          }}
          onRoleUpdated={loadRoles}
          rolConPermisos={roleToEdit}
        />
      )}
    </div>
  );
}
