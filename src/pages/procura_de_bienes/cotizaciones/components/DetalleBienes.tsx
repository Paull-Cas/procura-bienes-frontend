import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { DetalleBien } from "../../requerimientos/data/models";
import { UsuarioProfile } from "../../../data/models";
import Modal from "../../../components/Modal";
import FormCotizacionBien from "./modals/FormCotizacionBien";
import { DetalleCotizacion } from "../data/models";

interface DetalleBienesProps {
  user: UsuarioProfile;
  detallesBienes: DetalleBien[];
  bienesData: { [key: number]: string };
  procuraId: number;
  onCotizacionSuccess: (cotizacion: DetalleCotizacion) => void;
  moneda?: string; // Nueva prop para recibir la moneda
}

export default function DetalleBienes({
  user,
  detallesBienes,
  bienesData,
  procuraId,
  onCotizacionSuccess,
  moneda = "PEN", // Valor por defecto
}: DetalleBienesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState<DetalleBien | null>(
    null
  );

  const handleCardClick = (detalle: DetalleBien) => {
    setSelectedDetalle(detalle);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDetalle(null);
  };

  const handleCotizacionSave = (cotizacion: DetalleCotizacion) => {
    handleModalClose();
    onCotizacionSuccess(cotizacion);
  };

  if (detallesBienes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Bienes del Requerimiento
        </h1>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            ¡Todos los bienes han sido cotizados!
          </p>
          <p className="text-gray-500">
            Todos los bienes del requerimiento ya tienen una cotización
            asignada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Bienes del Requerimiento
          </h1>
          <div className="text-sm text-gray-600 sm:text-right">
            {detallesBienes.length} bien(es) disponible(s) para cotizar
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detallesBienes.map((detalle) => (
            <div
              key={detalle.id_detalle}
              className="relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer hover:border-orange-300 group"
              onClick={() => handleCardClick(detalle)}
            >
              {/* Overlay con texto "Cotizar" */}
              <div className="absolute inset-0 bg-black bg-opacity-100 rounded-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center z-10">
                <span className="flex items-center gap-2 text-orange-500 text-2xl font-bold">
                  <CircleDollarSign />
                  Cotizar
                </span>
              </div>

              <div className="space-y-3">
                {/* Nombre del bien */}
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {bienesData[detalle.id_bien] || "Bien sin nombre"}
                  </h2>
                </div>

                {/* Cantidad */}
                <div className="pt-2 border-t border-gray-200 space-y-2 flex justify-between items-center">
                  <span className="font-medium">Cantidad:</span>
                  <span className="text-sm text-gray-900">
                    {detalle.cantidad} {detalle.unidad_medida}
                  </span>
                </div>

                {/* Marca */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Marca:</span>
                  <span className="text-sm text-gray-700">{detalle.marca}</span>
                </div>

                {/* Características técnicas */}
                <div>
                  <span className="font-medium">Características Técnicas:</span>
                  <p className="text-sm text-gray-700">
                    {detalle.caracteristica_tecnica}
                  </p>
                </div>

                {/* Indicadores de ficha técnica y certificado */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  {/* Ficha Técnica */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                      Requiere Ficha Técnica
                    </span>
                    {detalle.aplica_ficha_tecnica ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        No
                      </span>
                    )}
                  </div>

                  {/* Certificado de Calidad */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                      Requiere Certificado Calidad
                    </span>
                    {detalle.aplica_certificado_calidad ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        No
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de cotización */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title="Cotizar Bien"
        subtitle={selectedDetalle ? bienesData[selectedDetalle.id_bien] : ""}
        size="xl"
      >
        {selectedDetalle && (
          <FormCotizacionBien
            user={user}
            detalleBien={selectedDetalle}
            procuraId={procuraId}
            onSave={handleCotizacionSave}
            onCancel={handleModalClose}
            edit={true}
            moneda={moneda}
          />
        )}
      </Modal>
    </>
  );
}
