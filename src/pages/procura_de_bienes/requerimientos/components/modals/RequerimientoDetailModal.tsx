import { useState, useMemo, useEffect, useCallback } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import Toast from "../../../../components/Toast";
import RechazoModal from "../../../../components/RechazoModal";
import Confirmacion from "../../../../components/Confirmacion";
import {
  Bien,
  DetalleBien,
  Requerimiento,
  RequerimientoCard,
} from "../../data/models";
import { Procura } from "../../../data/models";
import {
  fetchBienes,
  fetchDetalleRequerimiento,
  fetchRequerimiento,
  updateRequerimiento,
} from "../../data/api";

import { guardarProcura } from "../../../data/api";

import FormRequerimiento from "../FormRequerimiento";
import TablaBienes from "../TablaBienes";
import SelectBienModal from "../modals/SelectBienModal";
import AddBienDetailModal from "./AddBienDetailModal";
import ProcuraModal from "./ProcuraModal";
import { UsuarioProfile } from "../../../../data/models";

interface ModalDetalleRequerimiento {
  isOpen: boolean;
  onClose: () => void;
  user: UsuarioProfile;
  requerimientoCard: RequerimientoCard | null;
}

export default function RequerimientoDetailModal({
  isOpen,
  onClose,
  user,
  requerimientoCard,
}: ModalDetalleRequerimiento) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [permisos, setPermisos] = useState<string[]>([]);

  const [showConfirmAceptar, setShowConfirmAceptar] = useState(false);
  const [showConfirmRechazar, setShowConfirmRechazar] = useState(false);
  const [showConfirmActualizar, setShowConfirmActualizar] = useState(false);
  const [showProcuraModal, setShowProcuraModal] = useState(false); 
  
  const [tipoReq, setTipoReq] = useState("");

  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [isBienDetailModalOpen, setIsBienDetailModalOpen] = useState(false);
  const [editingBien, setEditingBien] = useState<DetalleBien | null>(null);
  const [isSelectBienModalOpen, setIsSelectBienModalOpen] = useState(false);
  const [nextTempId, setNextTempId] = useState(1);
  const [requerimiento, setRequerimiento] = useState<Requerimiento | null>(
    null
  );
  const [bienes, setBienes] = useState<Bien[]>([]);
  const [detallesBienes, setDetallesBienes] = useState<DetalleBien[]>([]);

  const bienesData = bienes.reduce(
    (acc, bien) => ({
      ...acc,
      [bien.id_bien]: bien.nombre,
    }),
    {} as { [key: number]: string }
  );

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const cargarData = async () => {
    let req = await fetchRequerimiento(requerimientoCard?.id_requerimiento);
    setRequerimiento(req);

    setBienes(await fetchBienes());

    setDetallesBienes(
      await fetchDetalleRequerimiento(requerimientoCard?.id_requerimiento)
    );

    let tipoEncontrado = "";
    const titulo = req.titulo.toUpperCase() || "";

    if (titulo.includes("HERR")) {
      tipoEncontrado = "HERR";
    } else if (titulo.includes("MAT")) {
      tipoEncontrado = "MAT";
    }

    setTipoReq(tipoEncontrado);
  };

  useEffect(() => {
    const getPermisos = user.permisos.map((p) => p.codigoPermiso);
    setPermisos(getPermisos);
    if (isOpen) cargarData();
  }, [requerimientoCard, isOpen]);

  const permisoEvaluar = useMemo(
    () => permisos.includes("REQ_EVALUATE_BIENES"),
    [permisos]
  );

  const permisoPublicar = useMemo(
    () => permisos.includes("REQ_PUBLI_BIENES"),
    [permisos]
  );

  const permisoActualizar = useMemo(
    () => permisos.includes("REQ_UPDATE_BIENES"),
    [permisos]
  );

  const handleUpdateRequerimiento = async (formData: Requerimiento) => {
    try {
      await updateRequerimiento(formData, detallesBienes);
      setDetallesBienes([]);
      setNextTempId(1);
      setToastMessage("¡Requerimiento Actualizado!");
      setToastType("success");
      setShowToast(true);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al guardar: ${message}`);
    }
  };

  const handleConfirmarAceptar = async () => {
    if (requerimiento) {
      const updated = {
        ...requerimiento,
        estado: "Aceptado",
        observaciones: "",
      };
      await updateRequerimiento(updated, detallesBienes);
      setShowConfirmAceptar(false);
      setToastMessage("¡Requerimiento Aceptado!");
      setToastType("success");
      setShowToast(true);
      onClose();
    }
  };

  const handleConfirmarRechazar = async (
    necesitaJustificacion: boolean,
    justificacion: string
  ) => {
    if (requerimiento) {
      const nuevoEstado = necesitaJustificacion
        ? "Espera Justificación"
        : "Rechazado";

      const updated = {
        ...requerimiento,
        estado: nuevoEstado,
        observaciones: justificacion,
      };

      await updateRequerimiento(updated, detallesBienes);
      setToastMessage("¡Requerimiento Rechazado!");
      setToastType("error");
      setShowToast(true);
      onClose();
    }
  };

  const handleConfirmarActualizar = async () => {
    if (requerimiento) {
      const fechaActual = new Date().toISOString().split("T")[0];
      const updated = {
        ...requerimiento,
        fecha_requerimiento: fechaActual,
      };
      await handleUpdateRequerimiento(updated);
      setShowConfirmActualizar(false);
    }
  };

  // Función mejorada para manejar la creación de procura
  const handleConfirmarProcura = async (procura: Procura) => {
    if (requerimiento) {
      try {
        // Guardar la procura
        await guardarProcura(procura);

        // Actualizar el estado del requerimiento a "Publicado"
        const updatedRequerimiento = {
          ...requerimiento,
          estado: "Publicado",
        };

        await updateRequerimiento(updatedRequerimiento, detallesBienes);

        // Actualizar el estado local para reflejar el cambio inmediatamente
        setRequerimiento(updatedRequerimiento);

        setShowProcuraModal(false);
        setToastMessage(
          "¡Procura creada y requerimiento publicado exitosamente!"
        );
        setToastType("success");
        setShowToast(true);
        onClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error desconocido";
        setToastMessage(
          `Error al crear procura y publicar requerimiento: ${message}`
        );
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const handleEditBien = (bien: DetalleBien) => {
    setEditingBien(bien);
    const bienItem = bienes.find((item) => item.id_bien === bien.id_bien);
    if (bienItem) {
      setSelectedBien(bienItem);
      setIsBienDetailModalOpen(true);
    }
  };
  const handleAddBienClick = () => {
    setIsSelectBienModalOpen(true);
  };
  const handleBienSelect = (bien: Bien) => {
    setSelectedBien(bien);
    setIsBienDetailModalOpen(true);
  };

  const cargarBienes = async () => {
    setBienes(await fetchBienes());
  };

  const handleAddNewBien = () => {
    cargarBienes();
  };

  const handleSaveBienDetail = (detail: DetalleBien) => {
    if (editingBien) {
      setDetallesBienes((prev) =>
        prev.map((item) =>
          item.id_detalle === editingBien.id_detalle
            ? { ...detail, id_temporal: item.id_detalle }
            : item
        )
      );
    } else {
      setDetallesBienes((prev) => [
        ...prev,
        {
          ...detail,
          id_detalle: nextTempId,
          id_requerimiento: undefined,
        },
      ]);
      setNextTempId((prev) => prev + 1);
    }

    setIsBienDetailModalOpen(false);
    setSelectedBien(null);
    setEditingBien(null);
  };

  const handleDeleteBien = (id: number) => {
    setDetallesBienes((prev) => prev.filter((item) => item.id_detalle !== id));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Detalle de ${requerimientoCard?.titulo}`}
        size="xxl"
      >
        <div className="space-y-6">
          <div
            className={`rounded-lg py-2 px-4 text-center text-sm font-bold ${
              requerimiento?.estado === "Aceptado"
                ? "bg-green-100 text-green-800"
                : requerimiento?.estado === "Pendiente"
                ? "bg-yellow-100 text-yellow-800"
                : requerimiento?.estado === "Rechazado"
                ? "bg-red-100 text-red-800"
                : requerimiento?.estado === "Espera Justificación"
                ? "bg-orange-100 text-orange-800"
                : requerimiento?.estado === "Publicado"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {requerimiento?.estado}
          </div>
          {requerimiento?.observaciones != "" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones de evaluación
              </label>
              <input
                type="text"
                value={requerimiento?.observaciones}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          )}

          <FormRequerimiento
            user={user}
            onSave={(formData) => {
              setRequerimiento(formData);
              setShowConfirmActualizar(true);
            }}
            nbienes={detallesBienes.length}
            title={"Detalle Requerimiento"}
            requerimiento={requerimiento}
            solicitante={requerimientoCard?.solicitante ?? null}
            edit={permisoActualizar && requerimientoCard?.estado == "Pendiente"}
          />

          <TablaBienes
            bienes={detallesBienes}
            onAddClick={handleAddBienClick}
            onEditClick={handleEditBien}
            onDeleteClick={handleDeleteBien}
            bienesData={bienesData}
            edit={permisoActualizar && requerimientoCard?.estado == "Pendiente"}
          />

          <SelectBienModal
            isOpen={isSelectBienModalOpen}
            onClose={() => setIsSelectBienModalOpen(false)}
            onSelectBien={handleBienSelect}
            onAddBien={handleAddNewBien}
            bienes={bienes}
            tipoReq={tipoReq}
          />

          <AddBienDetailModal
            isOpen={isBienDetailModalOpen}
            onClose={() => {
              setIsBienDetailModalOpen(false);
              setSelectedBien(null);
              setEditingBien(null);
            }}
            bien={selectedBien}
            onSave={handleSaveBienDetail}
            editingBien={editingBien}
            edit={!permisoEvaluar && requerimientoCard?.estado == "Pendiente"}
          />

          {/* Modal de Procura */}
          <ProcuraModal
            isOpen={showProcuraModal}
            onClose={() => setShowProcuraModal(false)}
            onConfirm={handleConfirmarProcura}
            requerimiento={requerimiento}
          />

          <Confirmacion
            isOpen={showConfirmAceptar}
            onClose={() => setShowConfirmAceptar(false)}
            onConfirm={handleConfirmarAceptar}
            title="Confirmar Aceptación"
            message="¿Estás seguro que deseas aceptar este requerimiento?"
            confirmText="Aceptar"
            cancelText="Cancelar"
          />

          <RechazoModal
            isOpen={showConfirmRechazar}
            onClose={() => setShowConfirmRechazar(false)}
            opciones={true}
            onConfirm={handleConfirmarRechazar}
          />

          <Confirmacion
            isOpen={showConfirmActualizar}
            onClose={() => setShowConfirmActualizar(false)}
            onConfirm={handleConfirmarActualizar}
            title="Confirmar Actualización"
            message={`¿Estás seguro que deseas actualizar el requerimiento?`}
            confirmText="Actualizar"
            cancelText="Cancelar"
          />

          <div className="flex justify-end gap-3">
            {permisoPublicar && requerimiento?.estado === "Aceptado" && (
              <Button
                variant="publicar"
                onClick={() => setShowProcuraModal(true)}
              >
                Publicar
              </Button>
            )}
            {permisoEvaluar && requerimiento?.estado !== "Publicado" && (
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
        </div>
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
