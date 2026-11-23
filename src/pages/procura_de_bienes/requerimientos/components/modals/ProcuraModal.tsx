import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import { Procura } from "../../../data/models";
import { Requerimiento } from "../../data/models";

interface ProcuraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (procura: Procura) => void;
  requerimiento: Requerimiento | null;
}

export default function ProcuraModal({
  isOpen,
  onClose,
  onConfirm,
  requerimiento,
}: ProcuraModalProps) {
  const [formData, setFormData] = useState<Procura>({
    id_procura: undefined,
    codigo_procura: "",
    id_usuario: 0,
    tipo_requerimiento: "",
    estado: "Publicado",
    fecha_maxima_cotizacion: "",
    fecha_maxima_abastecimiento: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Función para obtener la fecha máxima permitida
  const getMaxDateString = (): string => {
    if (formData.fecha_maxima_abastecimiento) {
      return formData.fecha_maxima_abastecimiento;
    }
    return ""; // Sin límite superior si no hay fecha de abastecimiento
  };

  useEffect(() => {
    if (isOpen && requerimiento) {
      setFormData({
        id_procura: undefined,
        codigo_procura: requerimiento.titulo,
        id_usuario: requerimiento.id_usuario,
        tipo_requerimiento: requerimiento.tipo_requerimiento,
        estado: "Activo",
        fecha_maxima_cotizacion: "",
        fecha_maxima_abastecimiento: requerimiento.fecha_maxima,
      });
      setErrors({});
    }
  }, [isOpen, requerimiento]);

  const handleInputChange = (field: keyof Procura, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fecha_maxima_cotizacion) {
      newErrors.fecha_maxima_cotizacion = "La fecha máxima de cotización es requerida";
    } else {
      // Validar que la fecha no sea en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const fechaCotizacion = new Date(formData.fecha_maxima_cotizacion);
      fechaCotizacion.setHours(0, 0, 0, 0);

      if (fechaCotizacion < today) {
        newErrors.fecha_maxima_cotizacion = "La fecha de cotización no puede ser anterior a hoy";
      }

      // Validar que la fecha de cotización no sea mayor a la fecha máxima de abastecimiento
      if (formData.fecha_maxima_abastecimiento) {
        const fechaAbastecimiento = new Date(formData.fecha_maxima_abastecimiento);
        fechaAbastecimiento.setHours(0, 0, 0, 0);
        
        if (fechaCotizacion > fechaAbastecimiento) {
          newErrors.fecha_maxima_cotizacion = "La fecha de cotización no puede ser mayor a la fecha máxima de abastecimiento";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      id_procura: undefined,
      codigo_procura: "",
      id_usuario: 0,
      tipo_requerimiento: "",
      estado: "Publicado",
      fecha_maxima_cotizacion: "",
      fecha_maxima_abastecimiento: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Procura"
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Información del Requerimiento
          </h3>
          <div className="text-sm text-blue-700">
            <p><strong>Título:</strong> {requerimiento?.titulo}</p>
            <p><strong>Tipo:</strong> {requerimiento?.tipo_requerimiento}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Máxima de Cotización *
          </label>
          <input
            type="date"
            value={formData.fecha_maxima_cotizacion}
            onChange={(e) => handleInputChange("fecha_maxima_cotizacion", e.target.value)}
            min={getTodayString()} // Evita seleccionar fechas anteriores a hoy
            max={getMaxDateString()} // Evita seleccionar fechas posteriores a la fecha de abastecimiento
            className={`w-full p-2 border rounded-md ${
              errors.fecha_maxima_cotizacion ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fecha_maxima_cotizacion && (
            <p className="text-red-500 text-sm mt-1">{errors.fecha_maxima_cotizacion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Máxima de Abastecimiento
          </label>
          <input
            type="date"
            value={formData.fecha_maxima_abastecimiento}
            disabled
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            type="button"
          >
            Publicar
          </Button>
        </div>
      </div>
    </Modal>
  );
}