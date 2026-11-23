import { useEffect, useState } from "react";
import FormRequerimiento from "./components/FormRequerimiento";
import TablaBienes from "./components/TablaBienes";
import SelectBienModal from "./components/modals/SelectBienModal";
import AddBienDetailModal from "./components/modals/AddBienDetailModal";
import { Bien, DetalleBien, Requerimiento } from "./data/models";
import { fetchBienes, createRequerimiento } from "./data/api";
import { UsuarioProfile } from "../../data/models";

interface NuevoRequerimientoProps {
  user: UsuarioProfile;
}

export default function NuevoRequerimiento({ user }: NuevoRequerimientoProps) {
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [isSelectBienModalOpen, setIsSelectBienModalOpen] = useState(false);
  const [isBienDetailModalOpen, setIsBienDetailModalOpen] = useState(false);
  const [bienesList, setBienesList] = useState<DetalleBien[]>([]);
  const [bienes, setBienes] = useState<Bien[]>([]);
  const [editingBien, setEditingBien] = useState<DetalleBien | null>(null);
  const [nextTempId, setNextTempId] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [formKey, setFormKey] = useState(0);
  
  const bienesData = bienes.reduce(
    (acc, bien) => ({
      ...acc,
      [bien.id_bien]: bien.nombre,
    }),
    {} as { [key: number]: string }
  );

  const showSuccessToast = (titulos: string[]) => {
    const titulosText = titulos.map(titulo => `• ${titulo}`).join('\n');
    setToastMessage(`Requerimientos creados exitosamente:\n${titulosText}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(`Error al guardar: ${message}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const resetForm = () => {
    setBienesList([]);
    setNextTempId(1);
    setFormKey(prev => prev + 1); // Esto forzará a recrear el FormRequerimiento
  };

  const handleSaveRequisition = async (formData: Requerimiento) => {
    try {
      const result = await createRequerimiento(formData, bienesList);
      
      if (!result.success) throw new Error(result.error);
      
      showSuccessToast(result.titulos || []);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      showErrorToast(message);
    } 
  };

  const cargarBienes = async () => {
    setBienes(await fetchBienes());
  };

  useEffect(() => {
    cargarBienes();
  }, []);

  const handleAddBienClick = () => {
    setIsSelectBienModalOpen(true);
  };

  const handleBienSelect = (bien: Bien) => {
    setSelectedBien(bien);
    setIsBienDetailModalOpen(true);
  };

  const handleAddNewBien = () => {
    cargarBienes();
  };

  const handleSaveBienDetail = (detail: DetalleBien) => {
    if (editingBien) {
      setBienesList((prev) =>
        prev.map((item) =>
          item.id_detalle === editingBien.id_detalle
            ? { ...detail, id_temporal: item.id_detalle }
            : item
        )
      );
    } else {
      setBienesList((prev) => [
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

  const handleEditBien = (bien: DetalleBien) => {
    setEditingBien(bien);
    const bienItem = bienes.find((item) => item.id_bien === bien.id_bien);
    if (bienItem) {
      setSelectedBien(bienItem);
      setIsBienDetailModalOpen(true);
    }
  };

  const handleDeleteBien = (id: number) => {
    setBienesList((prev) => prev.filter((item) => item.id_detalle !== id));
  };

  return (
    <div className="container p-2">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
            <div className="flex justify-between items-start">
              <pre className="text-sm font-medium whitespace-pre-line">{toastMessage}</pre>
              <button
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <FormRequerimiento 
        key={formKey}
        user={user}
        onSave={handleSaveRequisition} 
        nbienes={bienesList.length}
        title="Nuevo Requerimiento"
        requerimiento={null}
        solicitante={null}
        edit={true}
      />

      <TablaBienes
        bienes={bienesList}
        onAddClick={handleAddBienClick}
        onEditClick={handleEditBien}
        onDeleteClick={handleDeleteBien}
        bienesData={bienesData}
        edit={true}
      />

      <SelectBienModal
        isOpen={isSelectBienModalOpen}
        onClose={() => setIsSelectBienModalOpen(false)}
        onSelectBien={handleBienSelect}
        onAddBien={handleAddNewBien}
        bienes={bienes}
        tipoReq={''}
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
        edit={true}
      />
    </div>
  );
}