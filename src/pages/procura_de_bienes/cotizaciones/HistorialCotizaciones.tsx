import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Info, Trash2, Calendar, DollarSign, Clock, FileText } from "lucide-react";
import Confirmacion from "../../components/Confirmacion";
import Toast from "../../components/Toast";
import { UsuarioProfile } from "../../data/models";
import { Cotizacion } from "./data/models";
import { fetchCotizaciones, deleteCotizacion } from "./data/api";
import CotizacionDetailModal from "./components/modals/CotizacionDetailModal";

interface HistorialCotizacionesProps {
  user: UsuarioProfile;
}

export default function HistorialCotizaciones({
  user,
}: HistorialCotizacionesProps) {
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEst, setSearchEst] = useState("");
  const [permisos, setPermisos] = useState<string[]>([]);
  const [isCotizacionDetailModalOpen, setIsCotizacionDetailModalOpen] =
    useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] =
    useState<Cotizacion | null>(null);
  const [selectedCotizacion, setSelectedCotizacion] =
    useState<Cotizacion | null>(null);

  const permisosActualizar = useMemo(
    () =>
      permisos.filter(
        (p) => p === "COT_UPDATE_BIENES" || p === "COT_EVALUATE_BIENES"
      ),
    [permisos]
  );

  const permisoEliminar = useMemo(
    () => permisos.includes("COT_DELETE_BIENES"),
    [permisos]
  );

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const cargarCotizaciones = async () => {
    setCotizaciones(await fetchCotizaciones(user.id));
  };

  useEffect(() => {
    const getPermisos = user.permisos.map((p) => p.codigoPermiso);
    setPermisos(getPermisos);
    cargarCotizaciones();
  }, [isCotizacionDetailModalOpen]);

  const handleVerDetalles = (cotizacion: Cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setIsCotizacionDetailModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (cotizacionToDelete) {
      try {
        await deleteCotizacion(cotizacionToDelete.idCotizacion!);
        await cargarCotizaciones();
        setShowConfirmacion(false);
        setCotizacionToDelete(null);
        setToastMessage("Cotización eliminada exitosamente");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Error al eliminar la cotización:", error);
        setToastMessage("Error al eliminar la cotización. Por favor, intenta nuevamente.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  // Función para mostrar toast desde el modal
  const handleShowToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const filteredCotizaciones = cotizaciones.filter((cot) => {
    const matchesSearchTerm =
      cot.codigoCotizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      cot.numeroCotizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      cot.servicioOfertado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      cot.personaContacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesEstado =
      cot.estado?.toLowerCase().includes(searchEst.toLowerCase()) || false;

    return matchesSearchTerm && matchesEstado;
  });

  return (
    <div className="rounded-lg pb-2">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-orange-600" size={28} />
          Historial de Cotizaciones
        </h2>
        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <Search className="text-orange-500 ml-3" size={20} />
          <input
            type="text"
            placeholder="Buscar cotizaciones..."
            className="w-full p-2.5 outline-none rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <select
            name="estado"
            className="w-full p-2.5 rounded-lg outline-none cursor-pointer"
            onChange={(e) => setSearchEst(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Evaluado">Evaluados</option>
            <option value="Vencido">Vencidos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-4 p-2">
        {filteredCotizaciones.map((cot) => (
          <div
            key={cot.idCotizacion}
            className="group relative border rounded-lg p-2 m-2 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
            
            <div className="grid grid-cols-[minmax(0,_1fr)_auto] gap-4 pl-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900 lg:text-xl group-hover:text-orange-600 transition-colors">
                    {cot.codigoCotizacion || "Sin código"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium">Número:</span> {cot.numeroCotizacion || "N/A"}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={14} className="text-green-600 flex-shrink-0" />
                    <span className="font-medium">Precio:</span>
                    <span className="font-bold text-green-700">
                      {cot.moneda === "PEN" ? "S/." : "$"} {cot.precioSubtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                    <span className="font-medium">Fecha Cotización:</span> {cot.fechaCotizacion}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} className="text-red-500 flex-shrink-0" />
                    <span className="font-medium">Fecha Límite:</span> {cot.fechaLimiteCompra}
                  </div>
                  
                  {cot.plazoMinEntrega && cot.plazoMaxEntrega && (
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-gray-600 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-500 flex-shrink-0" />
                        <span className="font-medium">Plazo de entrega:</span>
                      </div>
                      <span>{cot.plazoMinEntrega} - {cot.plazoMaxEntrega}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                      cot.estado === "Aceptado" || cot.estado === "Aprobado"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : cot.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : cot.estado === "Evaluado"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {cot.estado}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-auto w-fit shrink-0 pl-4 justify-center">
                {permisosActualizar.length > 0 && (
                  <button
                    className="text-blue-400 hover:text-blue-600 transition-all p-1.5 rounded-lg hover:bg-blue-50 hover:scale-110"
                    title="Detalles"
                    onClick={() => handleVerDetalles(cot)}
                  >
                    <Info size={20} />
                  </button>
                )}

                {permisoEliminar && cot.estado === "Pendiente" && (
                  <button
                    className="text-red-400 hover:text-red-600 transition-all p-1.5 rounded-lg hover:bg-red-50 hover:scale-110"
                    title="Eliminar"
                    onClick={() => {
                      setCotizacionToDelete(cot);
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

        {filteredCotizaciones.length === 0 && (
          <div className="col-span-full text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No se encontraron cotizaciones
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      <CotizacionDetailModal
        isOpen={isCotizacionDetailModalOpen}
        onClose={() => setIsCotizacionDetailModalOpen(false)}
        user={user}
        cotizacion={selectedCotizacion!}
        onUpdate={() => {
          cargarCotizaciones();
        }}
        onShowToast={handleShowToast}
      />

      <Confirmacion
        isOpen={showConfirmacion}
        onClose={() => {
          setShowConfirmacion(false);
          setCotizacionToDelete(null);
        }}
        onConfirm={handleConfirmarEliminar}
        title="Confirmar eliminación"
        message={`¿Estás seguro que deseas eliminar la cotización "${cotizacionToDelete?.codigoCotizacion}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
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
    </div>
  );
}