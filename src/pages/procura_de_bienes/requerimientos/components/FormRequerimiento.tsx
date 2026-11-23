import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { Save } from "lucide-react";
import { Requerimiento } from "../data/models";
import { UsuarioProfile } from "../../../data/models";

interface FormRequerimientoProps {
  user: UsuarioProfile
  onSave: (formData: Requerimiento) => void;
  nbienes: number;
  title: string;
  requerimiento: Requerimiento | null;
  solicitante: string | null;
  edit: boolean;
}

export default function FormRequerimiento({
  user,
  onSave,
  nbienes,
  title,
  requerimiento,
  solicitante,
  edit,
}: FormRequerimientoProps) {

  const [formData, setFormData] = useState<Requerimiento>(
    requerimiento || {
      id_usuario: user.id,
      titulo: "",
      obra: "",
      tipo_requerimiento: "",
      descripcion: "",
      fecha_maxima: "",
    }
  );

  // Estados para manejo de fechas y validaciones
  const [minMaxDate, setMinMaxDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (requerimiento) {
      setFormData(requerimiento);
    }

    // Establecer fecha mínima para fecha máxima (7 días después de hoy)
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 7);
    const formattedMinDate = minDate.toISOString().split("T")[0];
    setMinMaxDate(formattedMinDate);
  }, [requerimiento]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!edit) return; 
    const { name, value } = e.target;
    
    // Limpiar mensaje de error cuando el usuario empiece a escribir
    if (errorMessage) {
      setErrorMessage("");
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateDates = (): boolean => {
    if (!formData.fecha_maxima) {
      setErrorMessage("La fecha máxima de abastecimiento es requerida.");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a inicio del día

    const maxDate = new Date(formData.fecha_maxima);
    maxDate.setHours(0, 0, 0, 0);

    // Validar fecha máxima (mínimo 7 días después de hoy)
    const minAllowedDate = new Date();
    minAllowedDate.setDate(today.getDate() + 7);
    minAllowedDate.setHours(0, 0, 0, 0);

    if (maxDate < minAllowedDate) {
      setErrorMessage(
        "La fecha máxima de abastecimiento debe ser al menos 7 días después de hoy."
      );
      return false;
    }

    // Validar que no sea más de 1 año en el futuro (opcional)
    const maxAllowedDate = new Date();
    maxAllowedDate.setFullYear(today.getFullYear() + 1);
    
    if (maxDate > maxAllowedDate) {
      setErrorMessage(
        "La fecha máxima de abastecimiento no puede ser más de 1 año en el futuro."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;

    // Validar campos requeridos básicos
    if (!formData.obra.trim()) {
      setErrorMessage("El campo Obra es requerido.");
      return;
    }

    // Validar fechas
    if (!validateDates()) {
      return;
    }

    // Si todas las validaciones pasan, proceder con el guardado
    setErrorMessage("");
    onSave(formData);
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante
            </label>
            <input
              type="text"
              value={solicitante ?? user.nombre}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Requerimiento
            </label>
            <input
              type="date"
              value={requerimiento?.fecha_requerimiento || getCurrentDate()}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Máxima de Abastecimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_maxima"
              value={formData.fecha_maxima}
              onChange={handleChange}
              disabled={!edit}
              min={minMaxDate}
              className={`w-full p-2 border rounded-md ${
                edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
              }`}
              required
            />
            {edit && (
              <p className="mt-1 text-xs text-gray-500">
                Debe ser al menos 7 días después de hoy
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obra <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="obra"
              placeholder="Nombre o código de la obra"
              value={formData.obra}
              onChange={handleChange}
              disabled={!edit}
              className={`w-full p-2 border rounded-md ${
                edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
              }`}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              placeholder={edit ? "Ingrese una descripción (opcional)" : "Sin descripción"}
              value={formData.descripcion}
              onChange={handleChange}
              disabled={!edit}
              rows={4}
              className={`w-full p-2 border rounded-md ${
                edit ? "border-gray-300" : "bg-gray-100 border-gray-200"
              }`}
            ></textarea>
          </div>
        </div>

        <div className="mt-6 text-right">
          {edit && nbienes > 0 && title ==="Nuevo Requerimiento" &&(
            <Button type="submit" icon={<Save size={18} />}>
              Guardar Requerimiento 
            </Button>
          )}
          {edit && nbienes > 0 && title ==="Actualizar Requerimiento" &&(
            <Button type="submit" icon={<Save size={18} />}>
              Guardar Cambios
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}