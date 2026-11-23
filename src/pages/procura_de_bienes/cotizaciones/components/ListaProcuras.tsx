import { useEffect, useState } from "react";
import { Procura } from "../../data/models";
import { fetchProcurasNoCotizadas } from "../../data/api";
import { Search, AlertCircle, Package, Calendar, Clock } from "lucide-react";
import { UsuarioProfile } from "../../../data/models";

interface ListaProcurasProps {
  user: UsuarioProfile;
  onProcuraClick?: (procura: Procura) => void;
}

export default function ListaProcuras({
  user,
  onProcuraClick
}: ListaProcurasProps) {
  const [procuras, setProcuras] = useState<Procura[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEst, setSearchEst] = useState("");

  const cargarProcuras = async () => {
    try {
      const data = await fetchProcurasNoCotizadas(user.id);
      setProcuras(data);
    } catch (error) {
      console.error("Error al cargar procuras:", error);
    }
  };

  useEffect(() => {
    cargarProcuras();
  }, [user.id]);

  const filteredProcuras = procuras.filter((procura) => {
    const matchesSearchTerm =
      (procura.codigo_procura?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (procura.tipo_requerimiento?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesEstado = searchEst === "" || 
      procura.estado?.toLowerCase() === searchEst.toLowerCase();

    return matchesSearchTerm && matchesEstado;
  });

  const handleProcuraClick = (procura: Procura) => {
    if (onProcuraClick) {
      onProcuraClick(procura);
    } else {
      console.log("Procura seleccionada:", procura);
    }
  };

  return (
    <div className="rounded-lg pb-2">
      {/* Header con búsquedas */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-orange-600" size={28} />
          Procuras de Bienes
        </h2>
        
        {/* Búsqueda por texto */}
        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <Search className="text-orange-500 ml-3" size={20} />
          <input
            type="text"
            placeholder="Buscar procuras..."
            className="w-full p-2.5 outline-none rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <select
            name="estado"
            className="w-full p-2.5 rounded-lg outline-none cursor-pointer"
            value={searchEst}
            onChange={(e) => setSearchEst(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Lista de procuras */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-4 p-2">
        {filteredProcuras.map((procura) => {
          const esVencido = procura.estado?.toLowerCase() === "vencido";
          
          return (
            <div
              key={procura.id_procura}
              className={`group relative border rounded-lg p-2 m-2 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                esVencido ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => !esVencido && handleProcuraClick(procura)}
            >
              {/* Barra lateral de color */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
              
              <div className="pl-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <h3 className="text-base font-semibold text-gray-900 lg:text-xl group-hover:text-orange-600 transition-colors">
                    {procura.codigo_procura || 'Sin código'}
                  </h3>
                  <span
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                      procura.estado?.toLowerCase() === "activo"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : procura.estado?.toLowerCase() === "vencido"
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {procura.estado || 'Sin estado'}
                  </span>
                </div>

                {esVencido && (
                  <div className="mb-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span className="font-medium">Esta procura ha vencido y no puede ser cotizada</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                      <span className="font-medium">Fecha Máxima para Cotización:</span>
                      {procura.fecha_maxima_cotizacion || 'No especificada'}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Clock size={14} className="text-red-500 flex-shrink-0" />
                      <span className="font-medium">Fecha Máxima para Abastecimiento:</span>
                      {procura.fecha_maxima_abastecimiento || 'No especificada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProcuras.length === 0 && (
          <div className="col-span-full text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No se encontraron procuras disponibles para cotizar
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}