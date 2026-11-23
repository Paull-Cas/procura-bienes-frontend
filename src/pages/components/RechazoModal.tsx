import Modal from "./Modal";
import Button from "./Button";
import { useState } from "react";

interface RechazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  opciones?: boolean | false;
  onConfirm: (necesitaJustificacion: boolean, observacion: string) => void;
}

export default function RechazoModal({
  isOpen,
  onClose,
  opciones,
  onConfirm,
}: RechazoModalProps) {
  const [observacion, setObservacion] = useState("");
  const [necesitaJustificacion, setNecesitaJustificacion] =
    useState<boolean>(true);
  const [error, setError] = useState("");

  const handleConfirmar = () => {
    if (necesitaJustificacion && !observacion.trim()) {
      setError("La justificación es obligatoria");
      return;
    }

    onConfirm(necesitaJustificacion, observacion);
    setObservacion("");
    setNecesitaJustificacion(true);
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Justificar Rechazo"
      size="md"
    >
      <div className="space-y-4">
        {opciones && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Necesita justificación?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="justificacion"
                  checked={necesitaJustificacion}
                  onChange={() => setNecesitaJustificacion(true)}
                />
                Sí
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="justificacion"
                  checked={!necesitaJustificacion}
                  onChange={() => setNecesitaJustificacion(false)}
                />
                No
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            value={observacion}
            onChange={(e) => {
              setObservacion(e.target.value);
              if (error) setError("");
            }}
            className={`w-full p-2 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            rows={4}
            placeholder="Ingrese la razón del rechazo ..."
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmar}>
            Confirmar Rechazo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
