import { useState, useCallback, useMemo } from "react";
import { Save, X, Upload, File, Eye, Package, DollarSign, FileText, Clock, CheckCircle, XCircle, ShoppingCart, ThumbsUp, ThumbsDown } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { DetalleBien } from "../../../requerimientos/data/models";
import { UsuarioProfile } from "../../../../data/models";
import { DetalleCotizacion } from "../../data/models";
import { useFileActions } from "../../../../components/useFileActions";
import FileViewerModal from "../../../../components/FileViewerModal";
import { FileData } from "../../../../data/models";

interface FormCotizacionBienProps {
  user: UsuarioProfile;
  detalleBien: DetalleBien;
  procuraId: number;
  onSave: (cotizacion: DetalleCotizacion) => void;
  onCancel: () => void;
  edit: boolean;
  editingCotizacion?: DetalleCotizacion;
  moneda?: string;
}

export default function FormCotizacionBien({
  user,
  detalleBien,
  procuraId,
  onSave,
  onCancel,
  edit,
  editingCotizacion,
  moneda = "PEN",
}: FormCotizacionBienProps) {
  const [formData, setFormData] = useState<DetalleCotizacion>(() => {
    if (editingCotizacion) {
      return editingCotizacion;
    }
    return {
      idCotizacion: procuraId,
      idDetalleRequerimiento: detalleBien.id_detalle,
      cantidad: detalleBien.cantidad,
      precioUnitario: 0,
      estado: "",
      fichaTecnica: "",
      brindaCertificadoCalidad: false,
    };
  });

  const [errors, setErrors] = useState<Partial<DetalleCotizacion>>({});
  const [fichaTecnicaFile, setFichaTecnicaFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [archivoActual, setArchivoActual] = useState<FileData | null>(null);

  // Verificar si el usuario tiene permiso para evaluar cotizaciones
  const permisoEvaluar = useMemo(
    () => user.permisos.some((p) => p.codigoPermiso === "COT_EVALUATE_BIENES"),
    [user.permisos]
  );

  const { handleViewFile } = useFileActions(
    setArchivoActual,
    setModalOpen
  );

  const getCurrencySymbol = () => {
    return moneda === "USD" ? "$" : "S/.";
  };

  const getEstadoConfig = (estado?: string) => {
    const configs = {
      'Pendiente': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        iconColor: 'text-yellow-600',
        label: 'Pendiente'
      },
      'Rechazado': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600',
        label: 'Rechazado'
      },
      'Aceptado': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        iconColor: 'text-blue-600',
        label: 'Aceptado'
      },
      'Comprado': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: ShoppingCart,
        iconColor: 'text-green-600',
        label: 'Comprado'
      }
    };

    return configs[estado as keyof typeof configs] || null;
  };

  const canEdit = () => {
    if (!formData.estado) return edit;
    return edit && (formData.estado === 'Pendiente' || formData.estado === 'Rechazado');
  };

  const isFieldEditable = canEdit();

  const handleInputChange = (field: keyof DetalleCotizacion, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type.startsWith("image/")
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = (reader.result as string).split(",")[1] || "";
          setFormData(prev => ({
            ...prev,
            fichaTecnica: base64Data,
          }));
          setFichaTecnicaFile(selectedFile);
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
    disabled: !isFieldEditable,
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<DetalleCotizacion> = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cotizacionData: DetalleCotizacion = {
        idCotizacion: formData.idCotizacion,
        idDetalleRequerimiento: formData.idDetalleRequerimiento,
        cantidad: formData.cantidad,
        precioUnitario: Number(formData.precioUnitario),
        // Si la cotización estaba rechazada y se está editando, cambiar estado a Pendiente
        estado: formData.estado === 'Rechazado' ? 'Pendiente' : formData.estado,
        fichaTecnica: formData.fichaTecnica,
        brindaCertificadoCalidad: formData.brindaCertificadoCalidad,
      };
      
      await onSave(cotizacionData);
    } catch (error) {
      console.error('Error al guardar cotización:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const precioTotal = typeof formData.precioUnitario === 'number' 
    ? formData.precioUnitario * formData.cantidad!
    : 0;

  const removeFile = () => {
    setFichaTecnicaFile(null);
    setFormData(prev => ({
      ...prev,
      fichaTecnica: "",
    }));
  };

  const getFileName = (detalleBien: DetalleBien) => {
    if (!detalleBien.marca) return `ficha_tecnica_${detalleBien.id_detalle}`;

    const cleanTitle = detalleBien.marca
      .replace(/[^a-z0-9áéíóúñü\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase()
      .substring(0, 30);

    return `ficha_tecnica_${cleanTitle}`;
  };

  const isEditing = !!editingCotizacion;
  const estadoConfig = getEstadoConfig(formData.estado);

  // Función para aceptar cotización
  const handleAceptarCotizacion = async () => {
    setIsSubmitting(true);
    try {
      const cotizacionActualizada: DetalleCotizacion = {
        ...formData,
        estado: 'Aceptado'
      };
      
      setFormData(cotizacionActualizada);
      await onSave(cotizacionActualizada);
      
      console.log('Cotización aceptada');
    } catch (error) {
      console.error('Error al aceptar cotización:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para rechazar cotización
  const handleRechazarCotizacion = async () => {
    setIsSubmitting(true);
    try {
      const cotizacionActualizada: DetalleCotizacion = {
        ...formData,
        estado: 'Rechazado'
      };
      
      setFormData(cotizacionActualizada);
      await onSave(cotizacionActualizada);
      
      console.log('Cotización rechazada');
    } catch (error) {
      console.error('Error al rechazar cotización:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
        {/* Badge de Estado */}
        {estadoConfig && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Estado de la cotización:</span>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${estadoConfig.color}`}>
                <estadoConfig.icon className={`h-4 w-4 ${estadoConfig.iconColor}`} />
                {estadoConfig.label}
              </div>
            </div>
            {!isFieldEditable && (formData.estado === 'Aceptado' || formData.estado === 'Comprado') && (
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Nota:</span> Esta cotización no puede ser editada porque ya fue {formData.estado.toLowerCase()}.
              </p>
            )}
            {isFieldEditable && formData.estado === 'Rechazado' && (
              <p className="mt-2 text-sm text-amber-600">
                <span className="font-medium">Importante:</span> Al guardar los cambios, el estado se restablecerá a "Pendiente" para una nueva evaluación.
              </p>
            )}
          </div>
        )}

        {/* Información del bien */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
            <Package className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Información del Bien
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Cantidad solicitada</label>
              <p className="text-base font-semibold text-gray-900">{formData.cantidad} {detalleBien.unidad_medida}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Marca</label>
              <p className="text-base font-semibold text-gray-900">{detalleBien.marca}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-600">Características técnicas</label>
              <p className="text-sm text-gray-700 leading-relaxed">{detalleBien.caracteristica_tecnica}</p>
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cotización</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Precio unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Unitario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full ${getCurrencySymbol() === "$" ? "pl-9" : "pl-14"} pr-4 py-2.5 border rounded-lg text-gray-900 transition-colors ${
                    !isFieldEditable 
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                      : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  } ${
                    errors.precioUnitario ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="0.00"
                  value={formData.precioUnitario || ''}
                  onChange={(e) => handleInputChange('precioUnitario', parseFloat(e.target.value) || 0)}
                  disabled={!isFieldEditable}
                />
              </div>
              {errors.precioUnitario && (
                <p className="mt-1 text-sm text-red-600">{errors.precioUnitario}</p>
              )}
            </div>

            {/* Precio total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Total
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  step="0.01"
                  className={`w-full ${getCurrencySymbol() === "$" ? "pl-9" : "pl-14"} pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold`}
                  placeholder="0.00"
                  value={precioTotal.toFixed(2)}
                  readOnly
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Calculado: {formData.cantidad} × {formData.precioUnitario || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Certificado de calidad */}
        {detalleBien.aplica_certificado_calidad && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Brinda Certificado de Calidad? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <label className={`flex-1 ${!isFieldEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.brindaCertificadoCalidad === true 
                    ? 'bg-blue-50 border-blue-600' 
                    : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="brindaCertificadoCalidad"
                    value="true"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={formData.brindaCertificadoCalidad === true}
                    onChange={() => handleInputChange('brindaCertificadoCalidad', true)}
                    disabled={!isFieldEditable}
                  />
                  <span className="text-sm font-medium text-gray-700">Sí</span>
                </div>
              </label>
              <label className={`flex-1 ${!isFieldEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.brindaCertificadoCalidad === false 
                    ? 'bg-blue-50 border-blue-600' 
                    : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="brindaCertificadoCalidad"
                    value="false"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={formData.brindaCertificadoCalidad === false}
                    onChange={() => handleInputChange('brindaCertificadoCalidad', false)}
                    disabled={!isFieldEditable}
                  />
                  <span className="text-sm font-medium text-gray-700">No</span>
                </div>
              </label>
            </div>
            {errors.brindaCertificadoCalidad && (
              <p className="mt-2 text-sm text-red-600">{errors.brindaCertificadoCalidad}</p>
            )}
          </div>
        )}

        {/* Documentos */}
        {detalleBien.aplica_ficha_tecnica && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
              <FileText className="h-5 w-5 text-gray-600" />
              <h4 className="text-lg font-semibold text-gray-900">Documentos</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ficha Técnica <span className="text-red-500">*</span>
              </label>
              
              {!fichaTecnicaFile && !formData.fichaTecnica ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : !isFieldEditable
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                      : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {!isFieldEditable 
                      ? "Sin archivo seleccionado"
                      : "Arrastre y suelte un archivo aquí"
                    }
                  </p>
                  {isFieldEditable && (
                    <p className="text-xs text-gray-500">
                      o haga clic para seleccionar • PDF e imágenes
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="p-2 bg-blue-100 rounded text-blue-700 mr-3">
                    <File size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fichaTecnicaFile ? fichaTecnicaFile.name : "Archivo cargado"}
                    </p>
                    {fichaTecnicaFile && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(fichaTecnicaFile.size / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {(formData.fichaTecnica || fichaTecnicaFile) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleViewFile(
                            formData.fichaTecnica!,
                            fichaTecnicaFile?.name || getFileName(detalleBien)
                          )
                        }
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Ver archivo"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {isFieldEditable && (
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar archivo"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {errors.fichaTecnica && (
                <p className="mt-2 text-sm text-red-600">{errors.fichaTecnica}</p>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center gap-2"
          >
            <X size={18} />
            <span>{!isFieldEditable ? 'Cerrar' : 'Cancelar'}</span>
          </button>
          
          {/* Botones de evaluación - solo para usuarios con permiso COT_EVALUATE_BIENES */}
          {permisoEvaluar && (
            <>
              <button
                type="button"
                onClick={handleRechazarCotizacion}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 border border-transparent rounded-lg text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ThumbsDown size={18} />
                <span>Rechazar</span>
              </button>
              <button
                type="button"
                onClick={handleAceptarCotizacion}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-green-600 border border-transparent rounded-lg text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ThumbsUp size={18} />
                <span>Aceptar</span>
              </button>
            </>
          )}
          
          {isFieldEditable && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 border border-transparent rounded-lg text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? 'Actualizar' : 'Agregar'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <FileViewerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fileData={archivoActual}
      />
    </>
  );
}