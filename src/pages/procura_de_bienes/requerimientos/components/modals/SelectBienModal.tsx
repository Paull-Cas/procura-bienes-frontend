import { useState } from "react";
import Modal from "../../../../components/Modal";
import Card, { CardContent, CardHeader } from "../ui/Card";
import { Bien } from "../../data/models";
import AddBienModal from "./AddBienModal";
import { Plus, Search } from "lucide-react";

interface SelectBienModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBien: (bien: Bien) => void;
  onAddBien: () => void;
  bienes: Bien[];
  tipoReq: string | null;
}

export default function ModalSeleccionarBien({
  isOpen,
  onClose,
  onSelectBien,
  onAddBien,
  bienes,
  tipoReq,
}: SelectBienModalProps) {
  const [isAddBienModalOpen, setIsAddBienModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBienes =
    tipoReq == "MAT"
      ? bienes.filter(
          (bien) =>
            bien.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
            bien.categoria.toLowerCase().includes("materiales")
        )
      : tipoReq == "HERR"
      ? bienes.filter(
          (bien) =>
            bien.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
            bien.categoria.toLowerCase().includes("herramientas")
        )
      : bienes.filter(
          (bien) =>
            bien.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bien.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleBienSelect = (bien: Bien) => {
    onSelectBien(bien);
  };

  const handleAddBien = () => {
    onAddBien();
    setIsAddBienModalOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Seleccionar Bien"
        size="xl"
      >
        <div className="mb-4 flex items-center border border-gray-300 rounded-md bg-white">
          <Search className="text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Buscar bienes..."
            className="w-full p-2 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Card
            hoverable
            onClick={() => setIsAddBienModalOpen(true)}
            className="h-full border-dashed border-2 border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-400"
          >
            <CardContent className="flex flex-col items-center justify-center h-full">
              <Plus size={32} className="mb-2" />
              <p className="font-medium">Agregar Nuevo Bien</p>
            </CardContent>
          </Card>
          {filteredBienes.map((bien) => (
            <Card
              key={bien.id_bien}
              hoverable
              onClick={() => handleBienSelect(bien)}
              className="h-full"
            >
              <CardHeader className="bg-gray-50">{bien.nombre}</CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{bien.descripcion}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    bien.categoria === "Herramientas"
                      ? "bg-blue-100 text-blue-800"
                      : bien.categoria === "Materiales"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {bien.categoria}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </Modal>

      <AddBienModal
        isOpen={isAddBienModalOpen}
        onClose={() => setIsAddBienModalOpen(false)}
        onSaveSuccess={handleAddBien}
      />
    </>
  );
}
