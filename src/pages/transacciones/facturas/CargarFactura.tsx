import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Edit } from "lucide-react";
import { Factura } from "../data/models";
import { uploadFactura, updateFactura } from "../data/api";
import { UsuarioProfile } from "../../data/models";
import Toast from "../../components/Toast";
import { Compra } from "../../procura_de_bienes/compras/data/models";
import { fetchComprasPorProveedor } from "../../procura_de_bienes/compras/data/api";

interface CargarFacturaProps {
  user: UsuarioProfile;
  edit?: boolean;
  facturaData?: Factura;
  existingFile?: File | null;
}

export default function CargarFactura({
  user,
  edit = false,
  facturaData,
  existingFile,
}: CargarFacturaProps) {
  const [formData, setFormData] = useState<Factura>({
    id_usuario: user.id,
    id_orden_operativa: undefined,
    fecha_emision: "",
    fecha_limite: "",
    monto_total: 0,
    moneda: "S/.",
    factura_file: "",
    descripcion: "",
  });

  // Órdenes de compra aceptadas del proveedor: solo contra estas se puede facturar
  const [ordenes, setOrdenes] = useState<Compra[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [minDueDate, setMinDueDate] = useState("");
  const [maxIssueDate, setMaxIssueDate] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const cargarOrdenes = async () => {
      const todas = await fetchComprasPorProveedor(user.id);
      setOrdenes(todas.filter((orden) => orden.estado === "Aceptada"));
    };
    cargarOrdenes();
  }, [user.id]);

  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    setMaxIssueDate(formattedToday);

    const minDue = new Date();
    minDue.setDate(today.getDate() + 7);
    const formattedMinDue = minDue.toISOString().split("T")[0];
    setMinDueDate(formattedMinDue);

    // Si está en modo edición y hay datos, rellenar el formulario
    if (edit && facturaData) {
      setFormData({
        ...facturaData,
        id_usuario: user.id, // Asegurar que el usuario sea el correcto
      });
    }

    // Si se pasa un archivo existente, configurarlo
    if (existingFile) {
      setFile(existingFile);

      // Convertir archivo a Base64 si es necesario
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1] || "";
        setFormData((prev) => ({
          ...prev,
          factura_file: base64Data,
        }));
      };
      reader.readAsDataURL(existingFile);
    }
  }, [edit, facturaData, user.id, existingFile]);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "monto_total"
          ? parseFloat(value)
          : name === "id_orden_operativa"
          ? value === ""
            ? undefined
            : parseInt(value)
          : value,
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type.startsWith("image/")
      ) {
        setFile(selectedFile);

        // Convertir a Base64 (solo la parte de datos)
        const reader = new FileReader();
        reader.onload = () => {
          // Extraer solo la parte de datos del Base64 (sin el prefijo)
          const base64Data = (reader.result as string).split(",")[1] || "";
          setFormData((prev) => ({
            ...prev,
            factura_file: base64Data,
          }));
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setToastMessage("Por favor, sube un archivo PDF o de IMAGEN válido.");
        setToastType("error");
        setShowToast(true);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setFormData((prev) => ({
      ...prev,
      factura_file: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // La factura debe estar asociada a una orden de compra aceptada (solo al crear)
    if (!edit && !formData.id_orden_operativa) {
      setToastMessage("Selecciona la orden de compra a facturar.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validación de campos requeridos
    if (!formData.factura_file) {
      setToastMessage("Por favor, sube un archivo de factura.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (
      !formData.fecha_emision ||
      !formData.fecha_limite ||
      formData.monto_total <= 0
    ) {
      setToastMessage("Por favor completa todos los campos requeridos");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validación de fechas
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a inicio del día

    const issueDate = new Date(formData.fecha_emision);
    const dueDate = new Date(formData.fecha_limite);

    // Validar fecha de emisión
    if (issueDate > today) {
      setToastMessage("La fecha de emisión no puede ser futura.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar fecha límite (mínimo 7 días después de hoy)
    const minDueDate = new Date();
    minDueDate.setDate(today.getDate() + 7);
    minDueDate.setHours(0, 0, 0, 0);

    if (dueDate < minDueDate) {
      setToastMessage(
        "La fecha límite debe ser al menos 7 días después de hoy."
      );
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que la fecha límite sea posterior a la emisión
    if (dueDate <= issueDate) {
      setToastMessage(
        "La fecha límite debe ser posterior a la fecha de emisión."
      );
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir fechas a formato ISO (YYYY-MM-DD)
      const facturaToSend = {
        ...formData,
        fecha_emision: new Date(formData.fecha_emision)
          .toISOString()
          .split("T")[0],
        fecha_limite: new Date(formData.fecha_limite)
          .toISOString()
          .split("T")[0],
      };

      // Usar updateFactura si está en modo edición, uploadFactura si está creando
      if (edit) {
        await updateFactura(facturaToSend);
      } else {
        await uploadFactura(facturaToSend);
      }

      // Solo resetear el formulario en modo creación
      if (!edit) {
        setFormData({
          id_usuario: user.id,
          id_orden_operativa: undefined,
          fecha_emision: "",
          fecha_limite: "",
          monto_total: 0,
          moneda: "S/.",
          factura_file: "",
          descripcion: "",
        });
        setFile(null);
      }

      const successMessage = edit
        ? "Factura actualizada correctamente"
        : "Factura cargada correctamente";

      setToastMessage(successMessage);
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error(error);
      const errorMessage = edit
        ? "Error al actualizar la factura"
        : "Error al cargar la factura";

      setToastMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {edit ? "Actualizar Factura" : "Cargar Nueva Factura"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!edit && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden de Compra <span className="text-red-500">*</span>
              </label>
              <select
                name="id_orden_operativa"
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.id_orden_operativa ?? ""}
                onChange={handleChange}
              >
                <option value="">Selecciona una orden aceptada</option>
                {ordenes.map((orden) => (
                  <option key={orden.idCompra} value={orden.idCompra}>
                    {orden.codigoOrdenCompra}
                  </option>
                ))}
              </select>
              {ordenes.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No tienes órdenes de compra aceptadas para facturar.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Emisión <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_emision"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.fecha_emision}
              onChange={handleChange}
              max={maxIssueDate}
            />
            <p className="mt-1 text-xs text-gray-500">
              Debe ser anterior o igual a hoy
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Límite <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_limite"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.fecha_limite}
              onChange={handleChange}
              min={minDueDate}
            />
            <p className="mt-1 text-xs text-gray-500">
              Debe ser al menos 7 días después de hoy
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="monto_total"
              required
              min="1"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0,00"
              value={formData.monto_total}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda <span className="text-red-500">*</span>
            </label>
            <select
              name="moneda"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.moneda}
              onChange={handleChange}
            >
              <option value="S/.">Soles</option>
              {/*<option value="$/.">Dólares</option>*/}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              placeholder="Ingrese una descripción (opcional)"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factura <span className="text-red-500">*</span>
            </label>

            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-2 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {edit
                    ? "Arrastre y suelte un archivo PDF o de IMAGEN para reemplazar, o haga clic para seleccionar"
                    : "Arrastre y suelte un archivo PDF o de IMAGEN aquí, o haga clic para seleccionar un archivo"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Solo archivos PDF o IMAGEN son aceptados
                </p>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="p-2 bg-blue-100 rounded-md text-blue-700 mr-3">
                  <File size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-right">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 border border-transparent rounded-md text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                {edit ? "Actualizando..." : "Cargando..."}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {edit ? (
                  <Edit className="h-4 w-4 mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {edit ? "Actualizar Factura" : "Subir Factura"}
              </span>
            )}
          </button>
        </div>
      </form>
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
