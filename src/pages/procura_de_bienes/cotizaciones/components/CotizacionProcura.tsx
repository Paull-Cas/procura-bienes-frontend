import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Button from "../../../components/Button";
import Toast from "../../../components/Toast";
import {
  Bien,
  DetalleBien,
  Requerimiento,
} from "../../requerimientos/data/models";
import { Procura } from "../../data/models";
import DetalleBienes from "./DetalleBienes";
import {
  fetchBienes,
  fetchDetalleRequerimiento,
} from "../../requerimientos/data/api";
import { UsuarioProfile } from "../../../data/models";
import { fetchRequerimientoByTitulo } from "../../data/api";
import FormCotizacion from "./FormCotizacion";
import TablaBienesCotizados from "./TablaBienesCotizados";
import { Cotizacion, DetalleCotizacion } from "../data/models";
import {
  createCotizacion
} from "../data/api";

interface CotizacionProcuraProps {
  user: UsuarioProfile;
  procura: Procura;
  onBack: () => void;
  onSuccess?: (titulo: string) => void;
  onError?: (error: string) => void;
}

export default function CotizacionProcura({
  user,
  procura,
  onBack,
  onSuccess,
  onError,
}: CotizacionProcuraProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [requerimiento, setRequerimiento] = useState<Requerimiento | null>(null);
  const [bienes, setBienes] = useState<Bien[]>([]);
  const [detallesBienes, setDetallesBienes] = useState<DetalleBien[]>([]);
  const [bienesCotizados, setBienesCotizados] = useState<DetalleCotizacion[]>([]);
  const [todosLosDetalles, setTodosLosDetalles] = useState<DetalleBien[]>([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<string>("PEN");

  // Verificar si la procura está vencida
  const esVencida = procura.estado?.toLowerCase() === "vencido";

  const bienesData = bienes.reduce(
    (acc, bien) => ({
      ...acc,
      [bien.id_bien]: bien.nombre,
    }),
    {} as { [key: number]: string }
  );

  const detallesBienesMap = todosLosDetalles.reduce(
    (acc, detalle) => ({
      ...acc,
      [detalle.id_detalle!]: detalle,
    }),
    {} as { [key: number]: DetalleBien }
  );

  const calcularPrecioSubtotal = (): number => {
    return bienesCotizados.reduce((total, cotizacion) => {
      const precioTotal =
        (cotizacion.precioUnitario || 0) * (cotizacion.cantidad || 0);
      return total + precioTotal;
    }, 0);
  };

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const cargarData = async () => {
    try {
      const req = await fetchRequerimientoByTitulo(procura.codigo_procura!);
      setRequerimiento(req);

      const bienesData = await fetchBienes();
      setBienes(bienesData);

      if (req?.id_requerimiento) {
        const todosLosDetallesData = await fetchDetalleRequerimiento(
          req.id_requerimiento
        );
        setTodosLosDetalles(todosLosDetallesData);
        setDetallesBienes(todosLosDetallesData);
        setBienesCotizados([]);
      }
    } catch (error) {
      console.error("Error al cargar datos de la procura:", error);
      setToastMessage("Error al cargar los datos de la procura");
      setToastType("error");
      setShowToast(true);
    }
  };

  useEffect(() => {
    cargarData();
  }, [procura.id_procura]);

  const handleCotizacionSuccess = () => {
    setToastMessage("Bien agregado exitosamente");
    setToastType("success");
    setShowToast(true);
  };

  const handleMonedaChange = (nuevaMoneda: string) => {
    setMonedaSeleccionada(nuevaMoneda);
  };

  const handleAgregarBienCotizado = (cotizacion: DetalleCotizacion) => {
    setBienesCotizados((prev) => [...prev, cotizacion]);

    setDetallesBienes((prev) =>
      prev.filter(
        (detalle) => detalle.id_detalle !== cotizacion.idDetalleRequerimiento
      )
    );

    handleCotizacionSuccess();
  };

  const handleEditarBienCotizado = (cotizacion: DetalleCotizacion) => {
    setBienesCotizados((prev) =>
      prev.map((item) =>
        item.idDetalleRequerimiento === cotizacion.idDetalleRequerimiento
          ? cotizacion
          : item
      )
    );

    setToastMessage("Bien actualizado");
    setToastType("success");
    setShowToast(true);
  };

  const handleEliminarBienCotizado = (idDetalleRequerimiento: number) => {
    const cotizacionEliminada = bienesCotizados.find(
      (c) => c.idDetalleRequerimiento === idDetalleRequerimiento
    );

    if (cotizacionEliminada && detallesBienesMap[idDetalleRequerimiento]) {
      setDetallesBienes((prev) => [
        ...prev,
        detallesBienesMap[idDetalleRequerimiento],
      ]);
    }

    setBienesCotizados((prev) =>
      prev.filter((c) => c.idDetalleRequerimiento !== idDetalleRequerimiento)
    );

    setToastMessage("Cotización eliminada exitosamente");
    setToastType("success");
    setShowToast(true);
  };

  const handleSaveCotizacion = async (formData: any) => {
    try {
      const result = await createCotizacion(formData, bienesCotizados);

      if (!result.success) throw new Error("Error al guardar la cotización");

      if (onSuccess) {
        onSuccess(result.titulo);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";

      if (onError) {
        onError(message);
      }

      throw error;
    }
  };

  const handleFormSuccess = () => {
    // Esta función se ejecutará cuando el formulario se envíe exitosamente
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de regreso */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              icon={<ArrowLeft size={18} />}
            >
              Regresar
            </Button>
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Procura {procura.codigo_procura}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Alerta de procura vencida */}
          {esVencida && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-3" size={24} />
                <div>
                  <h3 className="text-red-800 font-semibold text-lg">
                    Procura Vencida
                  </h3>
                  <p className="text-red-700 mt-1">
                    Esta procura ha vencido y no puede recibir nuevas cotizaciones. 
                    La fecha máxima de cotización fue el {procura.fecha_maxima_cotizacion}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de la Procura
                </label>
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    procura.estado?.toLowerCase() === "activo"
                      ? "bg-green-100 text-green-800"
                      : procura.estado?.toLowerCase() === "vencido"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {procura.estado || "Sin estado"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Máxima para Cotización
                </label>
                <p className="text-gray-900">
                  {procura.fecha_maxima_cotizacion || "No especificada"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Máxima para Abastecimiento
                </label>
                <p className="text-gray-900">
                  {procura.fecha_maxima_abastecimiento || "No especificada"}
                </p>
              </div>
            </div>
          </div>

          {/* Solo mostrar componentes de cotización si NO está vencida */}
          {!esVencida && (
            <>
              {detallesBienes.length > 0 && (
                <DetalleBienes
                  user={user}
                  detallesBienes={detallesBienes}
                  bienesData={bienesData}
                  procuraId={procura.id_procura!}
                  onCotizacionSuccess={handleAgregarBienCotizado}
                  moneda={monedaSeleccionada}
                />
              )}

              <TablaBienesCotizados
                bienesCotizados={bienesCotizados}
                bienesData={bienesData}
                detallesBienesMap={detallesBienesMap}
                onEditClick={handleEditarBienCotizado}
                onDeleteClick={handleEliminarBienCotizado}
                edit={true}
                iscreate={true}
                user={user}
                procuraId={procura.id_procura!}
                moneda={monedaSeleccionada}
              />

              <FormCotizacion
                user={user}
                procuraId={procura.id_procura!}
                onSave={handleSaveCotizacion}
                cotizacion={null}
                edit={true}
                isCreate={true}
                title="Nueva Cotización"
                precioSubtotalC={calcularPrecioSubtotal()}
                monedaSeleccionada={monedaSeleccionada}
                onMonedaChange={handleMonedaChange}
                onSuccess={handleFormSuccess}
                bienesCotizados={bienesCotizados.length}
              />
            </>
          )}

          {/* Mensaje informativo si está vencida */}
          {esVencida && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se pueden realizar cotizaciones
              </h3>
              <p className="text-gray-600">
                Esta procura ha expirado y ya no acepta nuevas cotizaciones.
              </p>
            </div>
          )}
        </div>
      </div>

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