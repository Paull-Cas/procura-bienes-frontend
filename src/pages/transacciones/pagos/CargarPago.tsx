import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, File, FileText } from "lucide-react";
import { fetchFacturas, uploadPago } from "../data/api";
import { UsuarioProfile } from "../../data/models";
import { Factura, Pago } from "../data/models";
import Toast from "../../components/Toast";

interface CargarPagoProps {
  user: UsuarioProfile;
  facturaPreseleccionada?: Factura;
  onPagoCreated?: () => void;
}

export default function CargarPago({ 
  user, 
  facturaPreseleccionada,
  onPagoCreated 
}: CargarPagoProps) {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [minNextDate, setMinNextDate] = useState("");
  const [maxIssueDate, setMaxIssueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formDataPago, setFormDataPago] = useState<Pago>({
    id_factura: facturaPreseleccionada?.id_factura || 0,
    monto_pago: 0,
    tipo_pago: "Factura",
    fecha_pago: "",
    proximo_pago_estimado: "",
    comprobante_file: "",
    descripcion: "",
  });

  const selectedFactura = facturaPreseleccionada || facturas.find(
    (fact) => fact.id_factura === Number(formDataPago.id_factura)
  );

  const [file, setFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Función helper para mostrar toast
  const showToastMessage = useCallback((message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  const cargarFacturas = async () => {
    try {
      const facturasData = await fetchFacturas(user.id);
      setFacturas(facturasData);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      showToastMessage("Error al cargar las facturas", "error");
    }
  };

  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    setMaxIssueDate(formattedToday);

    const minDue = new Date();
    minDue.setDate(today.getDate() + 1);
    const formattedMinDue = minDue.toISOString().split("T")[0];
    setMinNextDate(formattedMinDue);

    // Solo cargar facturas si no hay una preseleccionada
    if (!facturaPreseleccionada) {
      cargarFacturas();
    }
  }, [user.id, facturaPreseleccionada]);

  // Actualizar el formulario cuando cambie la factura preseleccionada
  useEffect(() => {
    if (facturaPreseleccionada) {
      setFormDataPago(prev => ({
        ...prev,
        id_factura: facturaPreseleccionada.id_factura ? facturaPreseleccionada.id_factura : 0 
      }));
    }
  }, [facturaPreseleccionada]);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type.startsWith("image/")
      ) {
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = (reader.result as string).split(",")[1] || "";
          setFormDataPago((prev) => ({
            ...prev,
            comprobante_file: base64Data,
          }));
        };
        reader.readAsDataURL(selectedFile);
      } else {
        showToastMessage("Por favor, sube un archivo PDF o de IMAGEN válido.", "error");
      }
    }
  }, [showToastMessage]);

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
    setFormDataPago((prev) => ({
      ...prev,
      comprobante_file: "",
    }));
  };

  const monedaFormato = (amount: number, currency: string) => {
    const formattedAmount = new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${currency} ${formattedAmount}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormDataPago((prev) => ({
      ...prev,
      [name]: name === "monto_pago" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!formDataPago.comprobante_file) {
      showToastMessage("Por favor, sube un comprobante de pago.", "error");
      return;
    }

    if (!formDataPago.id_factura || formDataPago.id_factura === 0) {
      showToastMessage("Por favor, selecciona una factura.", "error");
      return;
    }

    if (
      !formDataPago.fecha_pago ||
      !formDataPago.proximo_pago_estimado ||
      formDataPago.monto_pago <= 0
    ) {
      showToastMessage("Por favor completa todos los campos requeridos", "error");
      return;
    }

    // Validación de fechas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const issueDate = new Date(formDataPago.fecha_pago);
    const nextDate = new Date(formDataPago.proximo_pago_estimado);

    // Validar fecha de pago
    if (issueDate > today) {
      showToastMessage("La fecha de pago no puede ser futura.", "error");
      return;
    }

    // Validar fecha de próximo pago
    const minNextDate = new Date();
    minNextDate.setDate(today.getDate() + 1);
    minNextDate.setHours(0, 0, 0, 0);

    if (nextDate < minNextDate) {
      showToastMessage("La fecha de próximo pago debe ser al menos después de hoy.", "error");
      return;
    }

    // Validar monto vs saldo pendiente
    if (selectedFactura) {
      const saldoPendiente = selectedFactura.monto_total - (selectedFactura.monto_pagado || 0);
      if (formDataPago.monto_pago > saldoPendiente) {
        showToastMessage(
          `El monto del pago no puede ser mayor al saldo pendiente (${monedaFormato(saldoPendiente, selectedFactura.moneda)})`,
          "error"
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Convertir fechas a formato ISO (YYYY-MM-DD)
      const pagoToSend = {
        ...formDataPago,
        fecha_pago: new Date(formDataPago.fecha_pago).toISOString().split("T")[0],
        proximo_pago_estimado: new Date(formDataPago.proximo_pago_estimado).toISOString().split("T")[0],
      };

      await uploadPago(pagoToSend);

      // Resetear el formulario
      setFormDataPago({
        id_factura: facturaPreseleccionada?.id_factura || 0,
        monto_pago: 0,
        tipo_pago: "Factura",
        fecha_pago: "",
        proximo_pago_estimado: "",
        comprobante_file: "",
        descripcion: "",
      });
      setFile(null);

      showToastMessage("Pago registrado correctamente", "success");

      // Recargar facturas para actualizar los saldos (solo si no hay factura preseleccionada)
      if (!facturaPreseleccionada) {
        await cargarFacturas();
      }

      // Llamar al callback si existe
      if (onPagoCreated) {
        onPagoCreated();
      }
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      showToastMessage("Error al registrar el pago", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {facturaPreseleccionada ? 
            `Cargar Pago - ${facturaPreseleccionada.titulo}` : 
            "Cargar Nuevo Pago"
          }
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Factura <span className="text-red-500">*</span>
              </label>
              <select
                name="id_factura"
                value={formDataPago.id_factura}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!facturaPreseleccionada} 
              >
                <option value="">Seleccione una factura</option>
                {facturaPreseleccionada ? (
                  <option value={facturaPreseleccionada.id_factura}>
                    {facturaPreseleccionada.titulo} -{" "}
                    {monedaFormato(
                      facturaPreseleccionada.monto_total -
                        (facturaPreseleccionada.monto_pagado || 0),
                      facturaPreseleccionada.moneda
                    )}{" "}
                    ({facturaPreseleccionada.estado_factura})
                  </option>
                ) : (
                  facturas
                    .filter(
                      (fact) =>
                        fact.estado_factura === "Pagando" ||
                        fact.estado_factura === "Aprobada"
                    )
                    .map((factura) => (
                      <option key={factura.id_factura} value={factura.id_factura}>
                        {factura.titulo} -{" "}
                        {monedaFormato(
                          factura.monto_total -
                            (factura.monto_pagado || 0),
                          factura.moneda
                        )}{" "}
                        ({factura.estado_factura})
                      </option>
                    ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto del Pago <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monto_pago"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  value={formDataPago.monto_pago || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo_pago"
                  value={formDataPago.tipo_pago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Factura">Factura</option>
                  <option value="Detracción">Detracción</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Pago <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_pago"
                  value={formDataPago.fecha_pago}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={maxIssueDate}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Debe ser anterior o igual a hoy
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Pago Estimado <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="proximo_pago_estimado"
                  required
                  value={formDataPago.proximo_pago_estimado}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={minNextDate}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Debe ser al menos después de hoy
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formDataPago.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción adicional del pago..."
              />
            </div>
          </div>

          <div className="space-y-4">
            {selectedFactura && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Resumen de Factura {facturaPreseleccionada ? 'Preseleccionada' : 'Seleccionada'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Título:</span>
                    <span className="font-medium">
                      {selectedFactura.titulo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Total:</span>
                    <span className="font-medium">
                      {monedaFormato(
                        selectedFactura.monto_total,
                        selectedFactura.moneda
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Pagado:</span>
                    <span className="font-medium">
                      {monedaFormato(
                        selectedFactura.monto_pagado || 0,
                        selectedFactura.moneda
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Saldo Pendiente:</span>
                    <span className="font-bold text-red-600">
                      {monedaFormato(
                        selectedFactura.monto_total -
                          (selectedFactura.monto_pagado || 0),
                        selectedFactura.moneda
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedFactura.estado_factura === "Pagando"
                          ? "bg-green-100 text-green-800"
                          : selectedFactura.estado_factura === "Aprobada"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedFactura.estado_factura}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de Pago <span className="text-red-500">*</span>
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
                    Arrastre y suelte un archivo PDF o de IMAGEN aquí, o haga
                    clic para seleccionar un archivo
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
                Registrando...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Upload className="h-4 w-4 mr-2" />
                Registrar Pago
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