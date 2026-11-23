import { useState, useMemo, useEffect } from "react";
import { Cotizacion, DetalleCotizacion } from "../../data/models";
import { UsuarioProfile } from "../../../../data/models";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import FormCotizacion from "../FormCotizacion";
import TablaBienesCotizados from "../TablaBienesCotizados";
import DetalleBienes from "../DetalleBienes";
import {
  Bien,
  DetalleBien,
  Requerimiento,
} from "../../../requerimientos/data/models";
import { Procura } from "../../../data/models";
import {
  fetchBienes,
  fetchDetalleRequerimiento,
} from "../../../requerimientos/data/api";
import { fetchDetalleCotizacion, updateCotizacion, sendEvaluationCotizacion } from "../../data/api";
import {
  fetchRequerimientoByTitulo,
  fetchProcuraById,
} from "../../../data/api";
import { SendHorizontal } from "lucide-react";

interface CotizacionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UsuarioProfile;
  cotizacion: Cotizacion;
  onUpdate?: () => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export default function CotizacionDetailModal({
  isOpen,
  onClose,
  user,
  cotizacion,
  onUpdate,
  onShowToast,
}: CotizacionDetailModalProps) {
  if (!cotizacion) {
    return null;
  }

  const [bienes, setBienes] = useState<Bien[]>([]);
  const [todosLosDetalles, setTodosLosDetalles] = useState<DetalleBien[]>([]);
  const [detallesBienesDisponibles, setDetallesBienesDisponibles] = useState<DetalleBien[]>([]);
  const [bienesCotizados, setBienesCotizados] = useState<DetalleCotizacion[]>([]);
  const [requerimiento, setRequerimiento] = useState<Requerimiento | null>(null);
  const [procura, setProcura] = useState<Procura | null>(null);
  const [permisos, setPermisos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingEvaluacion, setIsSubmittingEvaluacion] = useState(false);
  
  // Estado para manejar la moneda
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<string>(cotizacion.moneda || "PEN");

  const bienesData = bienes.reduce(
    (acc, bien) => ({
      ...acc,
      [bien.id_bien]: bien.nombre,
    }),
    {} as { [key: number]: string }
  );

  // Crear un mapeo de DetalleBien para obtener información adicional
  const detallesBienesMap = todosLosDetalles.reduce(
    (acc, detalle) => ({
      ...acc,
      [detalle.id_detalle!]: detalle,
    }),
    {} as { [key: number]: DetalleBien }
  );

  // Función para calcular el subtotal de todos los bienes cotizados
  const calcularPrecioSubtotal = (): number => {
    return bienesCotizados.reduce((total, cotizacion) => {
      const precioTotal =
        (cotizacion.precioUnitario || 0) * (cotizacion.cantidad || 0);
      return total + precioTotal;
    }, 0);
  };

  // Función para manejar el cambio de moneda
  const handleMonedaChange = (nuevaMoneda: string) => {
    setMonedaSeleccionada(nuevaMoneda);
  };

  const cargarData = async () => {
    setIsLoading(true);
    try {
      // 1. Cargar la procura
      const procuraData: Procura = await fetchProcuraById(cotizacion.idProcura!);
      setProcura(procuraData);

      // 2. Cargar datos básicos del requerimiento y bienes
      const req = await fetchRequerimientoByTitulo(procuraData.codigo_procura!);
      setRequerimiento(req);

      const bienesData = await fetchBienes();
      setBienes(bienesData);

      if (req?.id_requerimiento) {
        // 3. Obtener todos los detalles del requerimiento
        const todosLosDetallesData = await fetchDetalleRequerimiento(
          req.id_requerimiento
        );
        setTodosLosDetalles(todosLosDetallesData);
      }

      // 4. Cargar detalles de cotización
      if (cotizacion.idCotizacion) {
        const detallesCotizacionData = await fetchDetalleCotizacion(
          cotizacion.idCotizacion
        );
        setBienesCotizados(detallesCotizacionData);

        // 5. Filtrar detalles disponibles (los que NO están cotizados)
        if (req?.id_requerimiento) {
          const todosLosDetallesData = await fetchDetalleRequerimiento(
            req.id_requerimiento
          );
          
          const idsCotizados = detallesCotizacionData.map(
            (dc) => dc.idDetalleRequerimiento
          );
          
          const disponibles = todosLosDetallesData.filter(
            (detalle: any) => !idsCotizados.includes(detalle.id_detalle!)
          );
          
          setDetallesBienesDisponibles(disponibles);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos de la cotización:", error);
      onShowToast("Error al cargar los datos de la cotización", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getPermisos = user.permisos.map((p) => p.codigoPermiso);
    setPermisos(getPermisos);
    if (isOpen) {
      // Reiniciar la moneda seleccionada al abrir el modal
      setMonedaSeleccionada(cotizacion.moneda || "PEN");
      cargarData();
    }
  }, [cotizacion, isOpen]);

  const permisoActualizar = useMemo(
    () => permisos.includes("COT_UPDATE_BIENES"),
    [permisos]
  );

  // Permiso para evaluar cotizaciones
  const permisoEvaluar = useMemo(
    () => permisos.includes("COT_EVALUATE_BIENES"),
    [permisos]
  );

  // Función para agregar un bien cotizado
  const handleAgregarBienCotizado = (cotizacion: DetalleCotizacion) => {
    setBienesCotizados((prev) => [...prev, cotizacion]);

    // Remover el bien de la lista de detalles disponibles
    setDetallesBienesDisponibles((prev) =>
      prev.filter(
        (detalle) => detalle.id_detalle !== cotizacion.idDetalleRequerimiento
      )
    );

    onShowToast("Bien agregado exitosamente", "success");
  };

  // Función para editar un bien cotizado
  const handleEditarBienCotizado = (cotizacion: DetalleCotizacion) => {
    setBienesCotizados((prev) =>
      prev.map((item) =>
        item.idDetalleRequerimiento === cotizacion.idDetalleRequerimiento
          ? cotizacion
          : item
      )
    );

    onShowToast("Bien actualizado exitosamente", "success");
  };

  // Función para eliminar un bien cotizado
  const handleEliminarBienCotizado = (idDetalleRequerimiento: number) => {
    const cotizacionEliminada = bienesCotizados.find(
      (c) => c.idDetalleRequerimiento === idDetalleRequerimiento
    );

    if (cotizacionEliminada && detallesBienesMap[idDetalleRequerimiento]) {
      // Devolver el bien a la lista de detalles disponibles
      setDetallesBienesDisponibles((prev) => [
        ...prev,
        detallesBienesMap[idDetalleRequerimiento],
      ]);
    }

    // Remover de bienes cotizados
    setBienesCotizados((prev) =>
      prev.filter((c) => c.idDetalleRequerimiento !== idDetalleRequerimiento)
    );

    onShowToast("Bien eliminado exitosamente", "success");
  };

  const handleUpdateCotizacion = async (formData: any) => {
    try {
      const result = await updateCotizacion(
        cotizacion.idCotizacion!,
        formData,
        bienesCotizados
      );

      onShowToast("Cotización actualizada exitosamente", "success");

      // Recargar datos después de actualizar
      await cargarData();

      // Notificar al componente padre
      if (onUpdate) {
        onUpdate();
      }

      // Cerrar el modal después de actualizar exitosamente
      setTimeout(() => {
        onClose();
      }, 0); // Pequeño delay para que el usuario vea el mensaje de éxito
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      
      onShowToast(message, "error");

      throw error;
    }
  };

  // Función callback para el éxito del formulario
  const handleFormSuccess = () => {
    // El mensaje ya se muestra en handleUpdateCotizacion
  };

  // Función para enviar la evaluación
  const handleEnviarEvaluacion = async () => {
    setIsSubmittingEvaluacion(true);
    
    try {
      // Preparar los datos según el DTO que espera el backend
      const evaluacionData = bienesCotizados.map((detalle) => ({
        idDetalleCotizacion: detalle.idDetalleCotizacion!,
        estado: detalle.estado || "Pendiente",
      }));
      
      console.log("Datos de evaluación listos para enviar:", evaluacionData);
      
      // Enviar la evaluación al backend
      await sendEvaluationCotizacion(cotizacion.idCotizacion!, evaluacionData);
      
      onShowToast("Evaluación enviada exitosamente", "success");
      
      // Recargar datos después de enviar
      await cargarData();
      
      // Notificar al componente padre
      if (onUpdate) {
        onUpdate();
      }
      
      // Cerrar el modal después de enviar exitosamente
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al enviar la evaluación";
      
      onShowToast(message, "error");
    } finally {
      setIsSubmittingEvaluacion(false);
    }
  };

  const esEditable = cotizacion.estado === "Pendiente" && permisoActualizar;
  
  // Verificar si se puede enviar la evaluación
  const puedeEnviarEvaluacion = 
    permisoEvaluar && 
    cotizacion.estado === "Pendiente" && 
    bienesCotizados.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Cotización - ${cotizacion.codigoCotizacion}`}
      size="xxl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información de la Procura */}
          {procura && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Procura {procura.codigo_procura}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado de la Procura
                  </label>
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      procura.estado?.toLowerCase() === "activo"
                        ? "bg-green-100 text-green-800"
                        : procura.estado?.toLowerCase() === "pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : procura.estado?.toLowerCase() === "cerrado"
                        ? "bg-gray-100 text-gray-800"
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
          )}

          {/* Badge de estado de la cotización */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cotización
            </label>
            <div
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                cotizacion.estado === "Pendiente"
                  ? "bg-yellow-100 text-yellow-800"
                  : cotizacion.estado === "Evaluado"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {cotizacion.estado}
            </div>
          </div>

          {/* Detalle de Bienes Disponibles (solo si es editable y hay bienes) */}
          {esEditable && detallesBienesDisponibles.length > 0 && (
            <DetalleBienes
              user={user}
              detallesBienes={detallesBienesDisponibles}
              bienesData={bienesData}
              procuraId={cotizacion.idProcura!}
              onCotizacionSuccess={handleAgregarBienCotizado}
              moneda={monedaSeleccionada}
            />
          )}

          {/* Tabla de bienes cotizados */}
          <TablaBienesCotizados
            bienesCotizados={bienesCotizados}
            bienesData={bienesData}
            detallesBienesMap={detallesBienesMap}
            onEditClick={handleEditarBienCotizado}
            onDeleteClick={handleEliminarBienCotizado}
            edit={esEditable}
            user={user}
            procuraId={cotizacion.idProcura!}
            moneda={monedaSeleccionada}
          />
  
          {/* Formulario de cotización */}
          <FormCotizacion
            user={user}
            procuraId={cotizacion.idProcura!}
            onSave={handleUpdateCotizacion}
            cotizacion={cotizacion}
            edit={esEditable}
            title={`Detalle de Cotización - ${cotizacion.numeroCotizacion}`}
            precioSubtotalC={calcularPrecioSubtotal()}
            monedaSeleccionada={monedaSeleccionada}
            onMonedaChange={handleMonedaChange}
            onSuccess={handleFormSuccess}
            bienesCotizados={bienesCotizados.length}
          />

          <div className="flex justify-end gap-3">
            {/* Botón de Enviar Evaluación - Solo visible para evaluadores */}
            {puedeEnviarEvaluacion && (
              <Button
                variant="primary"
                onClick={handleEnviarEvaluacion}
                disabled={isSubmittingEvaluacion}
                type="button"
              >
                {isSubmittingEvaluacion ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4 mr-2" />
                    Enviar Evaluación
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={onClose} type="button">
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}