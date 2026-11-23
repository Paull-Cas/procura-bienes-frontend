import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import { Bien, DetalleBien } from "../../data/models";

interface ModalDetalleBienProps {
  isOpen: boolean;
  onClose: () => void;
  bien: Bien | null;
  onSave: (detalle: DetalleBien) => void;
  editingBien: DetalleBien | null;
  edit: boolean;
}

const generarDetalleBien = (
  id_bien: number,
  id_requerimiento?: number
): DetalleBien => {
  return {
    id_bien,
    id_requerimiento,
    marca: "",
    unidad_medida: "",
    caracteristica_tecnica: "",
    cantidad: 0,
    aplica_ficha_tecnica: false,
    ficha_tecnica: "",
    aplica_certificado_calidad: false,
    certificado_calidad: "",
  };
};

export default function AddBienDetailModal({
  isOpen,
  onClose,
  bien,
  onSave,
  editingBien,
  edit,
}: ModalDetalleBienProps) {
  const [detalle, setDetalle] = useState<DetalleBien | null>(null);

  useEffect(() => {
    if (editingBien) setDetalle(editingBien);
    else if (bien) setDetalle(generarDetalleBien(bien.id_bien));
  }, [bien, editingBien]);

  if (!bien || !detalle) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setDetalle((prev) => {
      if (!prev) return null;

      if (type === "radio") {
        return { ...prev, [name]: value === "true" };
      } else if (type === "number") {
        return { ...prev, [name]: parseFloat(value) };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detalle) {
      onSave(detalle);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Especificaciones para: ${bien.nombre}`}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <h3 className="font-medium text-blue-800 mb-1">Datos del Bien</h3>
            <p className="text-sm text-blue-700 mb-1">{bien.nombre}</p>
            <p className="text-xs text-blue-600">{bien.descripcion}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="marca"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Marca
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={detalle.marca}
                onChange={handleChange}
                disabled={!edit}
                className={`w-full p-2 border rounded-md ${
                  edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
                }`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="unidad_medida"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unidad de Medida
              </label>
              <input
                type="text"
                id="unidad_medida"
                name="unidad_medida"
                value={detalle.unidad_medida}
                onChange={handleChange}
                disabled={!edit}
                className={`w-full p-2 border rounded-md ${
                  edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="caracteristica_tecnica"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Especificaciones Técnicas
            </label>
            <textarea
              id="caracteristica_tecnica"
              name="caracteristica_tecnica"
              value={detalle.caracteristica_tecnica}
              onChange={handleChange}
              rows={3}
              disabled={!edit}
              className={`w-full p-2 border rounded-md ${
                edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
              }`}
              required
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="cantidad"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cantidad Requerida
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={detalle.cantidad}
              onChange={handleChange}
              min="1"
              disabled={!edit}
              className={`w-full p-2 border rounded-md ${
                edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
              }`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Requiere Ficha Técnica?
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="aplica_ficha_tecnica"
                    value="true"
                    checked={detalle.aplica_ficha_tecnica === true}
                    onChange={handleChange}
                    disabled={!edit}
                    className={`h-4 w-4 text-blue-600 border-gray-300 ${
                      !edit ? "cursor-not-allowed opacity-75" : ""
                    }`}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="aplica_ficha_tecnica"
                    value="false"
                    checked={detalle.aplica_ficha_tecnica === false}
                    onChange={handleChange}
                    disabled={!edit} 
                    className={`h-4 w-4 text-blue-600 border-gray-300 ${
                      !edit ? "cursor-not-allowed opacity-75" : ""
                    }`}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Requiere Certificado de Calidad?
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="aplica_certificado_calidad"
                    value="true"
                    checked={detalle.aplica_certificado_calidad === true}
                    onChange={handleChange}
                    disabled={!edit}
                    className={`h-4 w-4 text-blue-600 border-gray-300 ${
                      !edit ? "cursor-not-allowed opacity-75" : ""
                    }`}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="aplica_certificado_calidad"
                    value="false"
                    checked={detalle.aplica_certificado_calidad === false}
                    onChange={handleChange}
                    disabled={!edit}
                    className={`h-4 w-4 text-blue-600 border-gray-300 ${
                      !edit ? "cursor-not-allowed opacity-75" : ""
                    }`}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {edit && (
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">Guardar Especificaciones</Button>
          </div>
        )}
      </form>
    </Modal>
  );
}
