import React, { useState, useMemo, useEffect } from 'react';
import { Check, X, Search } from 'lucide-react';
import { Permiso, Modulo, Rol } from '../data/models';
import { 
  clasificarModulosPorJerarquia, 
  agruparPermisosPorModulo,
  filtrarPermisos,
  getModulosHijoFiltrados,
} from './GrupoPermisosPorModulo';
import Toast from '../../components/Toast';

interface RolFormProps {
  initialData: {
    rol: Rol;
    selectedPermisos: number[];
  };
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  loading: boolean;
  isEditing?: boolean;
  permisos: Permiso[];
  modulos: Modulo[];
  roles: Rol[];
}

export default function RolForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  isEditing = false,
  permisos,
  modulos,
  roles,
}: RolFormProps) {
  const [formData, setFormData] = useState({
    ...initialData,
    selectedPermisos: initialData.selectedPermisos || []
  });

  // Actualizar formData cuando initialData cambie (importante para el modo edición)
  useEffect(() => {
    setFormData({
      ...initialData,
      selectedPermisos: initialData.selectedPermisos || []
    });
  }, [initialData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModuloPadre, setSelectedModuloPadre] = useState<number | null>(null);
  const [selectedModuloHijo, setSelectedModuloHijo] = useState<number | null>(null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const { modulosPadre, modulosHijo, modulosNieto } = useMemo(() => {
    return clasificarModulosPorJerarquia(modulos);
  }, [modulos]);

  const permisosFiltrados = useMemo(() => {
    return filtrarPermisos(
      permisos,
      searchTerm,
      selectedModuloPadre,
      selectedModuloHijo,
      modulosHijo,
      modulosNieto
    );
  }, [permisos, searchTerm, selectedModuloPadre, selectedModuloHijo, modulosHijo, modulosNieto]);

  const permisosPorModuloPadre = useMemo(() => {
    const gruposPermisos = agruparPermisosPorModulo(
      permisosFiltrados,
      modulosHijo,
      modulosPadre,
      modulosNieto
    );
    const agrupados = new Map<string, any>();

    gruposPermisos.forEach(grupo => {
      const padreKey = grupo.moduloPadre?.nombre || 'Sin categoría';
      
      if (!agrupados.has(padreKey)) {
        agrupados.set(padreKey, {
          moduloPadre: grupo.moduloPadre,
          grupos: [],
          totalPermisos: 0
        });
      }
      
      const padre = agrupados.get(padreKey)!;
      padre.grupos.push(grupo);
      padre.totalPermisos += grupo.permisos.length;
    });

    return Array.from(agrupados.entries()).map(([nombre, data]) => ({
      nombre,
      ...data
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [permisosFiltrados, modulosHijo, modulosPadre, modulosNieto]);

  // Obtener módulos hijo filtrados
  const modulosHijoFiltrados = useMemo(() => {
    return getModulosHijoFiltrados(modulosHijo, selectedModuloPadre);
  }, [modulosHijo, selectedModuloPadre]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePermiso = (permisoId: number) => {
    const currentPermisos = [...formData.selectedPermisos];
    const index = currentPermisos.indexOf(permisoId);
    
    if (index > -1) {
      currentPermisos.splice(index, 1);
    } else {
      currentPermisos.push(permisoId);
    }
    
    setFormData(prev => ({ ...prev, selectedPermisos: currentPermisos }));
  };

  const validateRolExists = (nombre: string): boolean => {
    const nombreTrimmed = nombre.trim().toLowerCase();
    
    // Si estamos editando, excluir el rol actual de la validación usando el nombre original
    const rolesToCheck = isEditing 
      ? roles.filter(rol => rol.nombre.toLowerCase() !== initialData.rol.nombre.toLowerCase())
      : roles;
    
    return rolesToCheck.some(rol => 
      rol.nombre.trim().toLowerCase() === nombreTrimmed
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el nombre no esté vacío
    if (!formData.rol.nombre.trim()) {
      setToastMessage("El nombre del rol es obligatorio");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que la descripción no esté vacía
    if (!formData.rol.descripcion.trim()) {
      setToastMessage("La descripción del rol es obligatoria");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el rol no exista
    if (validateRolExists(formData.rol.nombre)) {
      setToastMessage(`Ya existe un rol con el nombre "${formData.rol.nombre.trim()}"`);
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que tenga al menos un permiso seleccionado
    if (formData.selectedPermisos.length === 0) {
      setToastMessage("Debe seleccionar al menos un permiso para el rol");
      setToastType("error");
      setShowToast(true);
      return;
    }

    onSubmit(formData);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Reset módulo hijo cuando cambia módulo padre
  useEffect(() => {
    setSelectedModuloHijo(null);
  }, [selectedModuloPadre]);

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Rol
            </label>
            <input
              type="text"
              value={formData.rol.nombre}
              onChange={(e) => handleChange('rol', { ...formData.rol, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.rol.estado}
              onChange={(e) => handleChange('rol', { ...formData.rol, estado: parseInt(e.target.value) as 0 | 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.rol.descripcion}
            onChange={(e) => handleChange('rol', { ...formData.rol, descripcion: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Permisos
          </label>
          
          {/* Filtros de búsqueda */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <select
                value={selectedModuloPadre || ""}
                onChange={(e) => {
                  setSelectedModuloPadre(e.target.value ? parseInt(e.target.value) : null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Todas las categorías</option>
                {modulosPadre.map((modulo) => (
                  <option key={modulo.id_modulo} value={modulo.id_modulo}>
                    {modulo.nombre}
                  </option>
                ))}
              </select>

              <select
                value={selectedModuloHijo || ""}
                onChange={(e) => {
                  setSelectedModuloHijo(e.target.value ? parseInt(e.target.value) : null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || modulosHijoFiltrados.length === 0}
              >
                <option value="">Todos los módulos</option>
                {modulosHijoFiltrados.map((modulo) => (
                  <option key={modulo.id_modulo} value={modulo.id_modulo}>
                    {modulo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de permisos agrupados por módulo padre */}
          <div className="space-y-6 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {permisosPorModuloPadre.map((padreGroup) => (
              <div key={padreGroup.nombre} className="space-y-4">
                {/* Encabezado del módulo padre */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center justify-between">
                    {padreGroup.nombre}
                    <span className="text-sm font-normal text-blue-600">
                      {padreGroup.totalPermisos} permisos
                    </span>
                  </h3>
                  {padreGroup.moduloPadre?.descripcion && (
                    <p className="text-sm text-blue-700 mt-1">
                      {padreGroup.moduloPadre.descripcion}
                    </p>
                  )}
                </div>

                {/* Módulos hijo dentro de este padre */}
                {padreGroup.grupos.map((grupo : any) => (
                  <div key={grupo.moduloHijo.id_modulo} className="ml-4 space-y-3">
                    {/* Módulo hijo */}
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 border-l-4 border-gray-300 pl-3">
                      {grupo.moduloHijo.nombre}
                      <span className="text-xs text-gray-500">({grupo.permisos.length} permisos)</span>
                    </h4>
                    
                    {/* Módulos nieto si existen */}
                    {grupo.modulosNieto.length > 0 && (
                      <div className="ml-6 text-xs text-gray-600">
                        Submódulos: {grupo.modulosNieto.map((n : any) => n.nombre).join(', ')}
                      </div>
                    )}
                    
                    {/* Permisos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 ml-6">
                      {grupo.permisos.map((permiso : any) => (
                        <label
                          key={permiso.id_permiso}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedPermisos.includes(permiso.id_permiso)}
                            onChange={() => togglePermiso(permiso.id_permiso)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={loading}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{permiso.nombre}</div>
                            <div className="text-xs text-gray-500">{permiso.descripcion}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {permisosPorModuloPadre.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No se encontraron permisos</div>
                <div className="text-sm text-gray-400">
                  {searchTerm || selectedModuloPadre || selectedModuloHijo
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "No hay permisos disponibles"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" /> Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? 'Procesando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={3000}
        />
      )}
    </>
  );
}