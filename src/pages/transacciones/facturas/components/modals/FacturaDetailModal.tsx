import { useState, useEffect, useMemo, useCallback } from "react";
import { parseISO } from "date-fns";
import { Factura, Pago } from "../../../data/models";
import Modal from "../../../../components/Modal";
import {
  DollarSign,
  Calendar,
  FileText,
  PencilLine,
  CreditCard,
  BanknoteArrowUp,
} from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import ListaPagos from "../../../pagos/components/ListaPagos";
import { Eye } from "lucide-react";
import { FileData } from "../../../../data/models";
import { useFileActions } from "../../../../components/useFileActions";
import FileViewerModal from "../../../../components/FileViewerModal";
import { fetchPagosPorFactura, fetchFactura } from "../../../data/api";
import { UsuarioProfile } from "../../../../data/models";
import Button from "../../../../components/Button";
import Confirmacion from "../../../../components/Confirmacion";
import RechazoModal from "../../../../components/RechazoModal";
import { updateFactura } from "../../../data/api";
import Toast from "../../../../components/Toast";
import CargarFactura from "../../CargarFactura";
import CargarPago from "../../../pagos/CargarPago";

interface FacturaDetailModalProps {
  user: UsuarioProfile;
  isOpen: boolean;
  onClose: () => void;
  factura: Factura;
  onFacturaUpdate?: (factura: Factura) => void;
}

export default function FacturaDetailModal({
  user,
  isOpen,
  onClose,
  factura,
  onFacturaUpdate,
}: FacturaDetailModalProps) {
  const [facturaActual, setFacturaActual] = useState<Factura>(factura);
  const [pagos, setPagos] = useState<Pago[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [archivoActual, setArchivoActual] = useState<FileData | null>(null);
  const [permisos, setPermisos] = useState<string[]>([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [showConfirmAceptar, setShowConfirmAceptar] = useState(false);
  const [showConfirmRechazar, setShowConfirmRechazar] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCargarPagoModal, setShowCargarPagoModal] = useState(false);

  const [existingFile, setExistingFile] = useState<File | null>(null);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const cargarFactura = useCallback(async () => {
    try {
      const facturaAct = await fetchFactura(facturaActual.id_factura);
      setFacturaActual(facturaAct);
      if (onFacturaUpdate) {
        onFacturaUpdate(facturaAct);
      }
    } catch (error) {
      console.error("Error al cargar la factura:", error);
    }
  }, [facturaActual.id_factura, onFacturaUpdate]);

  const cargarPagos = useCallback(async (facturaId?: number) => {
    if (!facturaId) return;
    try {
      const pagosData = await fetchPagosPorFactura(facturaId);
      setPagos(pagosData);
    } catch (error) {
      console.error("Error al cargar los pagos:", error);
      setPagos([]);
    }
  }, []);

  const handleConfirmarAceptar = async () => {
    if (facturaActual) {
      try {
        const updated = {
          ...facturaActual,
          estado_factura: "Aprobada",
        };
        await updateFactura(updated);
        setFacturaActual(updated);

        // Notificar al componente padre
        if (onFacturaUpdate) {
          onFacturaUpdate(updated);
        }

        setShowConfirmAceptar(false);
        setToastMessage("¡Factura Aprobada!");
        setToastType("success");
        setShowToast(true);
        onClose();
      } catch (error) {
        console.error("Error al aprobar la factura:", error);
        setToastMessage("Error al aprobar la factura");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const handleConfirmarRechazar = async (
    necesitaJustificacion: boolean,
    observacion: string
  ) => {
    if (facturaActual) {
      try {
        const updated = {
          ...facturaActual,
          estado_factura: "Rechazada",
          observacion: observacion || "",
        };
        console.log("hola", updated.observacion);
        await updateFactura(updated);
        setFacturaActual(updated);

        // Notificar al componente padre
        if (onFacturaUpdate) {
          onFacturaUpdate(updated);
        }

        setToastMessage("¡Factura Rechazada!");
        setToastType("error");
        setShowToast(true);
        onClose();
      } catch (error) {
        console.error("Error al rechazar la factura:", error);
        setToastMessage("Error al rechazar la factura");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const base64ToFile = useCallback((base64: string, filename: string): File => {
    const dataUrl = base64.startsWith("data:")
      ? base64
      : `data:application/pdf;base64,${base64}`;

    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }, []);

  const handleOpenEditModal = useCallback(() => {
    if (facturaActual.factura_file) {
      try {
        const fileName = getFileName(facturaActual);
        const fileExtension =
          facturaActual.factura_file.startsWith("/9j/") ||
          facturaActual.factura_file.startsWith("iVBORw0KGgo") ||
          facturaActual.factura_file.startsWith("R0lGODlh")
            ? ".jpg"
            : ".pdf";

        const file = base64ToFile(
          facturaActual.factura_file,
          `${fileName}${fileExtension}`
        );
        setExistingFile(file);
      } catch (error) {
        console.error("Error al convertir archivo:", error);
        setExistingFile(null);
      }
    } else {
      setExistingFile(null);
    }

    setShowEditModal(true);
  }, [facturaActual, base64ToFile]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setExistingFile(null);
    cargarFactura();
  }, [cargarFactura]);

  const handleOpenCargarPagoModal = useCallback(() => {
    setShowCargarPagoModal(true);
  }, []);

  const handleCloseCargarPagoModal = useCallback(() => {
    setShowCargarPagoModal(false);
    cargarFactura();
    cargarPagos(facturaActual.id_factura);
  }, [cargarFactura, cargarPagos, facturaActual.id_factura]);

  const permisoEvaluar = useMemo(
    () => permisos.includes("INV_EVALUATE"),
    [permisos]
  );

  const permisoActualizar = useMemo(
    () => permisos.includes("INV_UPDATE"),
    [permisos]
  );

  const permisoCargarPago = useMemo(
    () => permisos.includes("PAY_CREATE"),
    [permisos]
  );

  const { handleViewFile, handleDownloadFile } = useFileActions(
    setArchivoActual,
    setModalOpen
  );

  useEffect(() => {
    if (isOpen && factura) {
      setFacturaActual(factura);
      setPermisos(user.permisos.map((p) => p.codigoPermiso));
      setPagos([]);
      cargarPagos(factura.id_factura);
    }
  }, [factura, user.permisos, cargarPagos, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPagos([]);
      setModalOpen(false);
      setArchivoActual(null);
      setShowToast(false);
      setShowConfirmAceptar(false);
      setShowConfirmRechazar(false);
      setShowEditModal(false);
      setShowCargarPagoModal(false);
      setExistingFile(null);
    }
  }, [isOpen]);

  const monedaFormato = (amount: number, currency: string) => {
    const formattedAmount = new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${currency} ${formattedAmount}`;
  };

  const fechaFormato = (dateString: string) => {
    try {
      const fecha = parseISO(dateString);
      return fecha.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      try {
        const fecha = new Date(dateString);
        return fecha.toLocaleDateString("es-PE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        return "Fecha inválida";
      }
    }
  };

  const montoPendiente =
    (facturaActual.monto_total ? facturaActual.monto_total : 0) -
    (facturaActual.monto_pagado ? facturaActual.monto_pagado : 0);
  const progresoPago =
    ((facturaActual.monto_pagado ? facturaActual.monto_pagado : 0) /
      (facturaActual ? facturaActual.monto_total : 1)) *
    100;

  const getFileName = (factura: Factura) => {
    if (!factura.titulo) return `factura_${factura.id_factura}`;

    const cleanTitle = factura.titulo
      .replace(/[^a-z0-9áéíóúñü\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    return cleanTitle;
  };

  const puedeCargarPago = useMemo(() => {
    return (
      permisoCargarPago &&
      (facturaActual.estado_factura === "Aprobada" ||
        facturaActual.estado_factura === "Pagando") &&
      montoPendiente > 0
    );
  }, [permisoCargarPago, facturaActual.estado_factura, montoPendiente]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Detalle de ${facturaActual?.titulo}`}
        subtitle={`Factura #${facturaActual?.id_factura}`}
        size="xl"
      >
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <StatusBadge
              status={facturaActual.estado_factura ?? "ninguno"}
              type="factura"
            />
            <div>
              {permisoActualizar &&
                facturaActual.estado_factura === "Pendiente" && (
                  <>
                    <Button
                      variant="secondary"
                      className="rounded-full gap-2"
                      onClick={handleOpenEditModal}
                    >
                      Actualizar <PencilLine size={18} />
                    </Button>
                  </>
                )}
            </div>
            <div>
              <button
                className="text-blue-600 bg-blue-50 hover:text-blue-900 focus:outline-none p-1 rounded-full hover:bg-blue-100 transition-colors"
                title="Ver Factura"
                onClick={() =>
                  handleViewFile(
                    facturaActual.factura_file,
                    getFileName(facturaActual)
                  )
                }
              >
                <div className="p-1 flex items-center gap-2">
                  <h3>Ver Factura</h3>
                  <Eye size={22} />
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-green-600" />
                <h3 className="font-semibold text-gray-800">Montos</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">
                    {monedaFormato(
                      facturaActual.monto_total,
                      facturaActual.moneda
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagado:</span>
                  <span className="font-medium text-green-600">
                    {monedaFormato(
                      facturaActual.monto_pagado
                        ? facturaActual.monto_pagado
                        : 0,
                      facturaActual.moneda
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendiente:</span>
                  <span className="font-medium text-orange-600">
                    {monedaFormato(montoPendiente, facturaActual.moneda)}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso de pago</span>
                  <span>{progresoPago.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresoPago}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">Fechas</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 text-sm">Emisión:</span>
                  <p className="font-medium">
                    {fechaFormato(facturaActual.fecha_emision)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Carga:</span>
                  <p className="font-medium">
                    {fechaFormato(
                      facturaActual.fecha_carga ? facturaActual.fecha_carga : ""
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Límite:</span>
                  <p className="font-medium">
                    {fechaFormato(facturaActual.fecha_limite)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className="text-purple-600" />
                <h3 className="font-semibold text-gray-800">Información</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 text-sm">Usuario:</span>
                  <p className="font-medium">{facturaActual.nombre_usuario}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">
                    Orden Operativa:
                  </span>
                  <p className="font-medium">
                    {facturaActual.id_orden_operativa}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Detracción:</span>
                  <p className="font-medium">
                    {facturaActual.porcentaje_detraccion}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          {facturaActual.observacion && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                Observaciones
              </h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {facturaActual.observacion}
              </p>
            </div>
          )}
          {facturaActual.descripcion && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {facturaActual.descripcion}
              </p>
            </div>
          )}
        </div>

        <div className="p-6">
          {facturaActual.estado_factura !== "Pendiente" ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard size={24} className="text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Historial de Pagos ({pagos.length})
                  </h3>
                </div>
                {puedeCargarPago && (
                  <button
                    onClick={handleOpenCargarPagoModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Cargar Pago <BanknoteArrowUp size={18} />
                  </button>
                )}
              </div>
              <ListaPagos user={user} pagos={pagos} />
            </>
          ) : (
            <p className="text-gray-600">
              Mientras la factura no sea aprobada no se podrán registrar ni
              visualizar pagos.
            </p>
          )}
        </div>
        <FileViewerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          fileData={archivoActual}
        />
        <div className="flex justify-end gap-3">
          {permisoEvaluar && facturaActual.estado_factura === "Pendiente" && (
            <>
              <Button
                variant="primary"
                onClick={() => setShowConfirmAceptar(true)}
              >
                Aceptar
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowConfirmRechazar(true)}
              >
                Rechazar
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
        </div>
        <Confirmacion
          isOpen={showConfirmAceptar}
          onClose={() => setShowConfirmAceptar(false)}
          onConfirm={handleConfirmarAceptar}
          title="Confirmar Aceptación"
          message="¿Estás seguro que deseas aceptar esta factura?"
          confirmText="Aceptar"
          cancelText="Cancelar"
        />
        <RechazoModal
          isOpen={showConfirmRechazar}
          onClose={() => setShowConfirmRechazar(false)}
          onConfirm={handleConfirmarRechazar}
          opciones={false}
        />
      </Modal>

      {/* Modal de edición de factura */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Actualizar Factura"
        size="xl"
      >
        <CargarFactura
          user={user}
          edit={true}
          facturaData={facturaActual}
          existingFile={existingFile}
        />
      </Modal>

      {/* Modal de cargar pago */}
      <Modal
        isOpen={showCargarPagoModal}
        onClose={handleCloseCargarPagoModal}
        title="Cargar Nuevo Pago"
        size="xl"
      >
        <CargarPago
          user={user}
          facturaPreseleccionada={facturaActual}
          onPagoCreated={handleCloseCargarPagoModal}
        />
      </Modal>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={1000}
        />
      )}
    </>
  );
}
