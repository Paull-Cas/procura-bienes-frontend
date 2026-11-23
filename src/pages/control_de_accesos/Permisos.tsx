import React, { useState, useEffect } from "react";
import { Search, Eye, AlertTriangle } from "lucide-react";
import { fetchPermisos, fetchModulos } from "./data/api";
import { Permiso, Modulo } from "./data/models";
import { getLucideIcon } from "../components/GetLucideIcon";
import { UsuarioProfile } from "../data/models";
import {
  clasificarModulosPorJerarquia,
  filtrarPermisos,
  agruparPermisosPorModulo,
  getModulosHijoFiltrados,
} from "./components/GrupoPermisosPorModulo";

interface PermisosProps {
  user: UsuarioProfile;
}

export default function Permisos({ user }: PermisosProps) {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModuloPadre, setSelectedModuloPadre] = useState<number | null>(null);
  const [selectedModuloHijo, setSelectedModuloHijo] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [permisosData, modulosData] = await Promise.all([
        fetchPermisos(),
        fetchModulos(),
      ]);

      setPermisos(permisosData);
      setModulos(modulosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const [permisosData, modulosData] = await Promise.all([
        fetchPermisos(),
        fetchModulos(),
      ]);
      setPermisos(permisosData);
      setModulos(modulosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedModuloHijo(null);
  }, [selectedModuloPadre]);

  // Usar las funciones utilitarias para procesar los datos
  const { modulosPadre, modulosHijo, modulosNieto } = clasificarModulosPorJerarquia(modulos);
  
  const permisosFiltrados = filtrarPermisos(
    permisos,
    searchTerm,
    selectedModuloPadre,
    selectedModuloHijo,
    modulosHijo,
    modulosNieto
  );

  const permisosByModuloHijo = agruparPermisosPorModulo(
    permisosFiltrados,
    modulosHijo,
    modulosPadre,
    modulosNieto
  );

  const modulosHijoFiltrados = getModulosHijoFiltrados(modulosHijo, selectedModuloPadre);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando permisos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error de conexión
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={handleRefresh}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center pb-6 justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Permisos por Módulos
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {permisos.length} permisos
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar permisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedModuloPadre || ""}
            onChange={(e) => {
              setSelectedModuloPadre(e.target.value ? parseInt(e.target.value) : null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            disabled={modulosHijoFiltrados.length === 0}
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

      <div className="space-y-6">
        {permisosByModuloHijo.map(({ moduloHijo, moduloPadre, modulosNieto, permisos: hijosPermisos }) => (
          <div key={moduloHijo.id_modulo} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {React.createElement(
                  getLucideIcon(moduloHijo.icono || "AlertTriangle"),
                  { className: "w-6 h-6 text-blue-600" }
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {moduloHijo.nombre}
                    </h2>
                    {moduloPadre && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {moduloPadre.nombre}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{moduloHijo.descripcion}</p>
                  {modulosNieto.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Submódulos:</span>
                      {modulosNieto.map(nieto => (
                        <span key={nieto.id_modulo} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {nieto.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {hijosPermisos.length} permisos
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hijosPermisos.map((permiso) => {                  
                  return (
                    <div
                      key={permiso.id_permiso}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {permiso.nombre}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-2">
                            {permiso.descripcion}
                          </p>
                          <span className="text-xs text-gray-500">
                            Código: {permiso.codigo_permiso}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {permisosByModuloHijo.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron permisos
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedModuloPadre || selectedModuloHijo
              ? "Intenta cambiar los filtros de búsqueda"
              : "No hay permisos configurados"}
          </p>
        </div>
      )}
    </div>
  );
}