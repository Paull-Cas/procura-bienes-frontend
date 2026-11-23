import { useEffect, useState, useMemo } from "react";
import { RequerimientoCard } from "./data/models";
import { deleteRequerimiento, fetchRequerimientos } from "./data/api";
import { Search, Info, Trash2, Calendar, Clock, FileText, Building2, User } from "lucide-react";
import RequerimientoDetailModal from "./components/modals/RequerimientoDetailModal";
import Confirmacion from "../../components/Confirmacion";
import { UsuarioProfile } from "../../data/models";

interface HistorialRequerimientosProps {
  user: UsuarioProfile;
}

export default function HistorialRequerimientos({ user }: HistorialRequerimientosProps) {
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [requerimientos, setRequerimientos] = useState<RequerimientoCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEst, setSearchEst] = useState("");
  const [permisos, setPermisos] = useState<string[]>([]);
  const [isRequerimientoDetailModalOpen, setIsRequerimientoDetailModalOpen] =
    useState(false);

  const [requerimientoToDelete, setRequerimientoToDelete] =
    useState<RequerimientoCard | null>(null);
  const [selectedRequerimiento, setSelectedRequerimiento] =
    useState<RequerimientoCard | null>(null);

  const permisosActualizar = useMemo(
    () =>
      permisos.filter(
        (p) => p === "REQ_UPDATE_BIENES" || p === "REQ_EVALUATE_BIENES" || p === "REQ_PUBLI_BIENES"
      ),
    [permisos]
  );

  const permisoEliminar = useMemo(
    () => permisos.includes("REQ_DELETE_BIENES"),
    [permisos]
  );

  const cargarRequerimientos = async () => {
    setRequerimientos(await fetchRequerimientos(user.id));
  };

  useEffect(() => {
    const getPermisos = user.permisos.map((p) => p.codigoPermiso);
    setPermisos(getPermisos);
    cargarRequerimientos();
  }, [isRequerimientoDetailModalOpen]);

  const handleVerDetalles = (requerimiento: RequerimientoCard) => {
    setSelectedRequerimiento(requerimiento);
    setIsRequerimientoDetailModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (requerimientoToDelete) {
      await deleteRequerimiento(requerimientoToDelete.id_requerimiento);
      await cargarRequerimientos();
      setShowConfirmacion(false);
      setRequerimientoToDelete(null);
    }
  };

  const filteredRequerimientos = requerimientos.filter((req) => {
    const matchesSearchTerm =
      req.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.obra.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = req.estado
      .toLowerCase()
      .includes(searchEst.toLowerCase());

    return matchesSearchTerm && matchesEstado;
  });

  return (
    <div className="rounded-lg pb-2">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-orange-600" size={28} />
          Historial de Requerimientos
        </h2>
        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <Search className="text-orange-500 ml-3" size={20} />
          <input
            type="text"
            placeholder="Buscar requerimientos..."
            className="w-full p-2.5 outline-none rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <select
            name="categoria"
            className="w-full p-2.5 rounded-lg outline-none cursor-pointer"
            onChange={(e) => setSearchEst(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Aceptado">Aceptados</option>
            <option value="Rechazado">Rechazados</option>
            <option value="Espera Justificación">Espera Justificación</option>
            <option value="Publicado">Publicados</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-4 p-2">
        {filteredRequerimientos.map((req) => (
          <div
            key={req.id_requerimiento}
            className="group relative border rounded-lg p-2 m-2 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
            
            <div className="grid grid-cols-[minmax(0,_1fr)_auto] gap-4 pl-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 lg:text-xl group-hover:text-orange-600 transition-colors">
                    {req.titulo}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <Calendar size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-medium">Fecha Requerimiento:</span>
                      <span>{req?.fecha_requerimiento}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-gray-600">
                    <Clock size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-medium">Fecha Máx. Abastecimiento:</span>
                      <span>{req?.fecha_maxima_abastecimiento}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={14} className="text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Obra:</span> {req.obra}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-purple-600 flex-shrink-0" />
                    <span className="font-medium">Solicitante:</span> {req.solicitante}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      req.estado === "Aceptado"
                        ? "bg-green-100 text-green-800"
                        : req.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.estado === "Rechazado"
                        ? "bg-red-100 text-red-800"
                        : req.estado === "Espera Justificación"
                        ? "bg-orange-100 text-orange-800"
                        : req.estado === "Publicado"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {req.estado}
                  </span>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      req.estado === "Aceptado" ||
                      req.estado === "Rechazado" ||
                      req.estado === "Espera Justificación" ||
                      req.estado === "Publicado"
                        ? "bg-green-100 text-green-800"
                        : req.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Evaluación:{" "}
                    {["Aceptado", "Rechazado", "Espera Justificación", "Publicado"].includes(
                      req.estado
                    )
                      ? "Realizado"
                      : "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-auto w-fit shrink-0 pl-4 justify-center">
                {permisosActualizar.length > 0 && (
                  <button
                    className="text-blue-400 hover:text-blue-600 transition-all p-1.5 rounded-lg hover:bg-blue-50 hover:scale-110"
                    title="Detalles"
                    onClick={() => handleVerDetalles(req)}
                  >
                    <Info size={20} />
                  </button>
                )}

                {permisoEliminar && req.estado === "Pendiente" && (
                  <button
                    className="text-red-400 hover:text-red-600 transition-all p-1.5 rounded-lg hover:bg-red-50 hover:scale-110"
                    title="Eliminar"
                    onClick={() => {
                      setRequerimientoToDelete(req);
                      setShowConfirmacion(true);
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRequerimientos.length === 0 && (
          <div className="col-span-full text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No se encontraron requerimientos
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      <RequerimientoDetailModal
        isOpen={isRequerimientoDetailModalOpen}
        onClose={() => {
          setIsRequerimientoDetailModalOpen(false);
        }}
        user={user}
        requerimientoCard={selectedRequerimiento}
      />
      <Confirmacion
        isOpen={showConfirmacion}
        onClose={() => {
          setShowConfirmacion(false);
          setRequerimientoToDelete(null);
        }}
        onConfirm={handleConfirmarEliminar}
        title="Confirmar eliminación"
        message={`¿Estás seguro que deseas eliminar el requerimiento "${requerimientoToDelete?.titulo}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}