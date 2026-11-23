import React, { useState, useEffect, useCallback } from "react";
import {Mail, Phone, Building2, Save, Upload, X, File, SendHorizontal, Eye, AlertCircle, Calendar, DollarSign, Package, CreditCard, Shield, Clock, User, FileArchive } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { UsuarioProfile } from "../../../data/models";
import { Cotizacion } from "../data/models";
import { useFileActions } from "../../../components/useFileActions";
import FileViewerModal from "../../../components/FileViewerModal";
import { FileData } from "../../../data/models";
import { Usuario } from "../../../control_de_accesos/data/models";
import { fetchUsuarioById } from "../../../control_de_accesos/data/api";
import { is } from "date-fns/locale";

interface FormCotizacionProps {
  user: UsuarioProfile;
  procuraId?: number;
  onSave: (formData: Cotizacion) => void;
  cotizacion: Cotizacion | null;
  edit: boolean;
  isCreate?: boolean;
  title: string;
  precioSubtotalC?: number;
  monedaSeleccionada?: string;
  onMonedaChange?: (moneda: string) => void;
  onSuccess?: () => void;
  bienesCotizados?: number;
}

export default function FormCotizacion({
  user,
  procuraId,
  onSave,
  cotizacion,
  edit,
  isCreate,
  title,
  precioSubtotalC,
  monedaSeleccionada = "PEN",
  onMonedaChange,
  onSuccess,
  bienesCotizados = 0,
}: FormCotizacionProps) {
  const [formData, setFormData] = useState<Cotizacion>(() => {
    if (cotizacion) {
      return cotizacion;
    }
    const today = new Date();
    const fechaActual = today.toISOString().split("T")[0];

    return {
      idProcura: procuraId,
      idUsuario: user.id,
      numeroCotizacion: "",
      fechaCotizacion: fechaActual,
      servicioOfertado: "",
      moneda: monedaSeleccionada,
      garantia: "",
      formaPago: "",
      plazoMinEntrega: "",
      plazoMaxEntrega: "",
      notas: "",
      informacionPago: "",
      documentoCotizacion: "",
      fechaLimiteCompra: "",
      estado: "",
      precioSubtotal: 0,
      personaContacto: user.nombre || "",
      telefonoMovil: "",
      telefonoOficina: "",
      email: user.email || "",
      incluyeIgv: true,
      incluyeCostosTransporte: true,
      costosTransporte: 0,
    };
  });
  const [usuarioProveedor, setUsuarioProveedor] = useState<Usuario | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [archivoActual, setArchivoActual] = useState<FileData | null>(null);

  const { handleViewFile } = useFileActions(
    setArchivoActual,
    setModalOpen
  );

  const calcularPrecioTotal = (
    subtotal: number,
    incluyeIgv: boolean,
    incluyeCostoTransporte: boolean,
    costosTransporte: number
  ) => {
    let total = subtotal || 0;

    if (!incluyeCostoTransporte) {
      total += costosTransporte || 0;
    }

    if (!incluyeIgv) {
      total = total * 1.18;
    }

    return total;
  };

  useEffect(() => {
    const subtotalBase = precioSubtotalC || 0;
    const nuevoPrecioTotal = calcularPrecioTotal(
      subtotalBase,
      formData.incluyeIgv,
      formData.incluyeCostosTransporte,
      formData.costosTransporte || 0
    );

    setFormData((prev) => ({
      ...prev,
      precioSubtotal: nuevoPrecioTotal,
    }));
  }, [
    precioSubtotalC,
    formData.incluyeIgv,
    formData.incluyeCostosTransporte,
    formData.costosTransporte,
  ]);

  useEffect(() => {
    if (monedaSeleccionada !== formData.moneda) {
      setFormData((prev) => ({
        ...prev,
        moneda: monedaSeleccionada,
      }));
    }
  }, [monedaSeleccionada, formData.moneda]);

  useEffect(() => {
    if (cotizacion) {
      setFormData(cotizacion);
      (async () => {
        setUsuarioProveedor(await fetchUsuarioById(cotizacion.idUsuario!));
      })();
    }
    else {
      (async () => {
        setUsuarioProveedor(await fetchUsuarioById(user.id));
      })();
    }
  }, [cotizacion]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!edit) return;
    const { name, value, type } = e.target;

    if (errorMessage) {
      setErrorMessage("");
    }

    let newValue: any = value;

    if (type === "number") {
      newValue = parseFloat(value) || 0;
    } else if (type === "radio") {
      newValue = value === "true";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === "moneda" && onMonedaChange) {
      onMonedaChange(value);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type.startsWith("image/") ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/msword"
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = (reader.result as string).split(",")[1] || "";
          setFormData((prev) => ({
            ...prev,
            documentoCotizacion: base64Data,
          }));
          // Establecer el archivo después de que se haya leído correctamente
          setDocumentoFile(selectedFile);
        };
        reader.readAsDataURL(selectedFile);
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
    disabled: !edit,
  });

  const removeFile = () => {
    setDocumentoFile(null);
    setFormData((prev) => ({
      ...prev,
      documentoCotizacion: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;

    if (!formData.servicioOfertado!.trim()) {
      setErrorMessage("El servicio ofertado es requerido.");
      return;
    }

    if (!formData.personaContacto!.trim()) {
      setErrorMessage("La persona de contacto es requerida.");
      return;
    }

    if (!formData.email!.trim()) {
      setErrorMessage("El email es requerido.");
      return;
    }

    if (formData.plazoMinEntrega && formData.plazoMaxEntrega) {
      const minDate = new Date(formData.plazoMinEntrega);
      const maxDate = new Date(formData.plazoMaxEntrega);

      if (minDate > maxDate) {
        setErrorMessage(
          "La fecha mínima de entrega no puede ser posterior a la fecha máxima."
        );
        return;
      }
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const formDataToSave = {
        ...formData,
        estado: bienesCotizados > 0 ? "Pendiente" : formData.estado
      };
      
      await onSave(formDataToSave);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      setErrorMessage("Error al guardar la cotización. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getCurrencySymbol = () => {
    return formData.moneda === "USD" ? "$" : "S/.";
  };

  const getFileName = (cotizacion: Cotizacion | null) => {
    if (!cotizacion?.servicioOfertado) {
      // Si no hay cotización o servicio, usar el nombre del archivo cargado
      if (documentoFile) return documentoFile.name.split('.')[0];
      return `cotizacion_${procuraId || 'nueva'}`;
    }

    const cleanTitle = cotizacion.servicioOfertado
      .replace(/[^a-z0-9áéíóúñü\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase()
      .substring(0, 30);

    return cleanTitle;
  };

  const puedeEnviarCotizacion = bienesCotizados > 0;

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7" />
            {title}
          </h2>
          <p className="text-blue-100 text-sm mt-1">Complete todos los campos requeridos</p>
        </div>

        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Sección: Información General */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-blue-100">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Información General</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={usuarioProveedor?.nombre_usuario || ""}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium shadow-sm"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Fecha Cotización
                  </label>
                  <input
                    type="date"
                    value={formData.fechaCotizacion}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Precios y Moneda */}
            <div className="mb-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-5">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Configuración de Precios</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Los precios incluyen IGV <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center ${edit ? "cursor-pointer" : "cursor-default"}`}>
                      <input
                        type="radio"
                        name="incluyeIgv"
                        value="true"
                        checked={formData.incluyeIgv === true}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Sí</span>
                    </label>
                    <label className={`flex items-center ${edit ? "cursor-pointer" : "cursor-default"}`}>
                      <input
                        type="radio"
                        name="incluyeIgv"
                        value="false"
                        checked={formData.incluyeIgv === false}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-4 h-4 text-red-600 accent-red-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ¿Incluye Costos de Transporte? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center ${edit ? "cursor-pointer" : "cursor-default"}`}>
                      <input
                        type="radio"
                        name="incluyeCostosTransporte"
                        value="true"
                        checked={formData.incluyeCostosTransporte === true}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Sí</span>
                    </label>
                    <label className={`flex items-center ${edit ? "cursor-pointer" : "cursor-default"}`}>
                      <input
                        type="radio"
                        name="incluyeCostosTransporte"
                        value="false"
                        checked={formData.incluyeCostosTransporte === false}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-4 h-4 text-red-600 accent-red-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {!formData.incluyeCostosTransporte && (
                  <div className="md:col-span-2 bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Costos de Transporte
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        {getCurrencySymbol()}
                      </span>
                      <input
                        type="number"
                        name="costosTransporte"
                        value={formData.costosTransporte || ""}
                        onChange={handleChange}
                        disabled={!edit}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full ${
                          getCurrencySymbol() === "$" ? "pl-10" : "pl-14"
                        } pr-4 py-3 border rounded-lg shadow-sm ${
                          edit ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" : "bg-gray-100 border-gray-200"
                        }`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 italic">
                      Si no incluye transporte, ingrese el monto adicional.
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Moneda <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleChange}
                    disabled={!edit}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <option value="PEN">🇵🇪 Soles (PEN)</option>
                    <option value="USD">🇺🇸 Dólares (USD)</option>
                  </select>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio Total
                    {formData.incluyeIgv && (
                      <span className="text-xs text-green-600 ml-1 font-normal">(con IGV)</span>
                    )}
                    {!formData.incluyeCostosTransporte && (
                      <span className="text-xs text-blue-600 ml-1 font-normal">(+ transporte)</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                      {getCurrencySymbol()}
                    </span>
                    <input
                      type="number"
                      name="precioSubtotal"
                      value={formData.precioSubtotal?.toFixed(2) || "0.00"}
                      disabled
                      min="0"
                      step="0.01"
                      className={`w-full ${
                        getCurrencySymbol() === "$" ? "pl-10" : "pl-14"
                      } pr-4 py-3 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 font-bold text-lg text-gray-700 shadow-sm`}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Calculado automáticamente
                    {!formData.incluyeIgv ? " + IGV (18%)" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección: Plazos y Fechas */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Plazos y Fechas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plazo Mínimo Entrega <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="plazoMinEntrega"
                    value={formData.plazoMinEntrega}
                    onChange={handleChange}
                    disabled={!edit}
                    min={getCurrentDate()}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plazo Máximo Entrega <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="plazoMaxEntrega"
                    value={formData.plazoMaxEntrega}
                    onChange={handleChange}
                    disabled={!edit}
                    min={formData.plazoMinEntrega || getCurrentDate()}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Límite de Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaLimiteCompra"
                    value={formData.fechaLimiteCompra}
                    onChange={handleChange}
                    disabled={!edit}
                    min={getCurrentDate()}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Detalles de la Cotización */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-blue-100">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Detalles de la Cotización</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Cotización <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numeroCotizacion"
                    value={formData.numeroCotizacion}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="COT-2024-001"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Garantía <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="garantia"
                    value={formData.garantia}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="6 meses"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Forma de Pago <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="formaPago"
                    value={formData.formaPago}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="50% adelanto, 50% contra entrega"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Servicio Ofertado <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="servicioOfertado"
                    value={formData.servicioOfertado}
                    onChange={handleChange}
                    disabled={!edit}
                    rows={3}
                    placeholder="Descripción breve del servicio que se está ofertando"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Información de Pago <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="informacionPago"
                    value={formData.informacionPago}
                    onChange={handleChange}
                    disabled={!edit}
                    rows={3}
                    placeholder="Detalles adicionales sobre el pago, cuentas bancarias, etc."
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <File className="w-4 h-4 inline mr-1" />
                    Documento Cotización <span className="text-red-500">*</span>
                  </label>

                  {!documentoFile && !formData.documentoCotizacion ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? "border-blue-500 bg-blue-50 scale-105"
                          : edit
                          ? "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                          : "border-gray-200 bg-gray-50 cursor-not-allowed"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className={`mx-auto h-12 w-12 mb-3 ${isDragActive ? "text-blue-500" : "text-gray-400"}`} />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {edit
                          ? "Arrastre y suelte un archivo aquí"
                          : "Sin archivo seleccionado"}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, imágenes o documentos de Word
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border-2 border-blue-200 shadow-sm">
                      <div className="p-3 bg-blue-500 rounded-lg text-white mr-4">
                        <File size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {documentoFile ? documentoFile.name : "Archivo cargado"}
                        </p>
                        {documentoFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            {(documentoFile.size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {formData.documentoCotizacion && (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewFile(
                                formData.documentoCotizacion!,
                                getFileName(cotizacion)
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Ver archivo"
                          >
                            <Eye size={20} />
                          </button>
                        )}
                        {edit && (
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Información de Contacto */}
            <div className="mb-8 bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <FileArchive className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1"/>Persona de Contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="personaContacto"
                    value={formData.personaContacto}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="Nombre completo"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1"/>Teléfono Móvil <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefonoMovil"
                    value={formData.telefonoMovil}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="+51 999 999 999"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1"/>Teléfono Oficina <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefonoOficina"
                    value={formData.telefonoOficina}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="+51 1 999 9999"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1"/>Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!edit}
                    placeholder="usuario1@example.invalid"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                      edit
                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 border-gray-200"
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección: Notas Adicionales */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                disabled={!edit}
                rows={4}
                placeholder="Notas adicionales sobre la cotización, lugar de entrega, condiciones especiales, etc."
                className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                  edit
                    ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-gray-100 border-gray-200"
                }`}
              />
            </div>

            {/* Botones de Acción */}
            {isCreate && bienesCotizados > 0 && (
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span>Enviando Cotización...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={20} />
                      <span>Enviar Cotización</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {edit && bienesCotizados > 0 && (
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span>Enviando Cotización...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Actualizar Cotización</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Alerta cuando no hay bienes cotizados */}
            {(edit || isCreate) && bienesCotizados === 0 && (
              <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 mb-1">
                      Acción Requerida
                    </h4>
                    <p className="text-sm text-amber-700">
                      Debe cotizar al menos un bien antes de poder enviar la cotización. 
                      Complete la tabla de bienes para habilitar el envío.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Modal para visualizar archivos */}
      <FileViewerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fileData={archivoActual}
      />
    </>
  );
}