import React, { useState } from "react";
import Button from "../../../components/Button";
import { Info, Trash2, Clock, XCircle, CheckCircle, ShoppingCart, AlertCircle } from "lucide-react";
import { DetalleCotizacion } from "../data/models";
import { DetalleBien } from "../../requerimientos/data/models";
import Modal from "../../../components/Modal";
import FormCotizacionBien from "./modals/FormCotizacionBien";
import { UsuarioProfile } from "../../../data/models";
import { is } from "date-fns/locale";

interface TablaBienesCotizadosProps {
  bienesCotizados: DetalleCotizacion[];
  bienesData: { [key: number]: string };
  detallesBienesMap: { [key: number]: DetalleBien };
  onEditClick: (cotizacion: DetalleCotizacion) => void;
  onDeleteClick: (cotizacionId: number) => void;
  edit: boolean;
  iscreate?: boolean;
  user?: UsuarioProfile;
  procuraId?: number;
  moneda?: string;
}

const TablaBienesCotizados: React.FC<TablaBienesCotizadosProps> = ({
  bienesCotizados,
  bienesData,
  detallesBienesMap,
  onEditClick,
  onDeleteClick,
  edit,
  iscreate,
  user,
  procuraId,
  moneda = "PEN",
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] =
    useState<DetalleCotizacion | null>(null);
  const [hoveredEstado, setHoveredEstado] = useState<number | null>(null);

  const getCurrencySymbol = () => {
    return moneda === "USD" ? "$" : "S/.";
  };

  const getEstadoConfig = (estado?: string) => {
    const configs = {
      'Pendiente': {
        color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
        icon: Clock,
        iconColor: 'text-yellow-600',
        label: 'Pendiente'
      },
      'Rechazado': {
        color: 'bg-red-100 hover:bg-red-200 border-red-300',
        icon: XCircle,
        iconColor: 'text-red-600',
        label: 'Rechazado'
      },
      'Aceptado': {
        color: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
        icon: CheckCircle,
        iconColor: 'text-blue-600',
        label: 'Aceptado'
      },
      'Comprado': {
        color: 'bg-green-100 hover:bg-green-200 border-green-300',
        icon: ShoppingCart,
        iconColor: 'text-green-600',
        label: 'Comprado'
      }
    };

    return configs[estado as keyof typeof configs] || {
      color: 'bg-gray-100 hover:bg-gray-200 border-gray-300',
      icon: AlertCircle,
      iconColor: 'text-gray-600',
      label: 'Sin estado'
    };
  };

  const calcularPrecioTotal = (cotizacion: DetalleCotizacion): number => {
    return (cotizacion.precioUnitario || 0) * (cotizacion.cantidad || 0);
  };

  const calcularTotalGeneral = (): number => {
    return bienesCotizados.reduce((total, cotizacion) => {
      return total + calcularPrecioTotal(cotizacion);
    }, 0);
  };

  const handleEditModalClick = (cotizacion: DetalleCotizacion) => {
    setSelectedCotizacion(cotizacion);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCotizacion(null);
  };

  const handleSaveCotizacion = (cotizacion: DetalleCotizacion) => {
    onEditClick(cotizacion);
    handleModalClose();
  };

  const handleDeleteConfirm = (idDetalleRequerimiento: number) => {
    onDeleteClick(idDetalleRequerimiento);
  };

  const getBienNombre = (idDetalleRequerimiento: number): string => {
    const detalleBien = detallesBienesMap[idDetalleRequerimiento];
    if (detalleBien) {
      return bienesData[detalleBien.id_bien] || "Bien sin nombre";
    }
    return "Bien sin nombre";
  };

  const getBienMarca = (idDetalleRequerimiento: number): string => {
    const detalleBien = detallesBienesMap[idDetalleRequerimiento];
    return detalleBien?.marca || "-";
  };

  const getUnidadMedida = (idDetalleRequerimiento: number): string => {
    const detalleBien = detallesBienesMap[idDetalleRequerimiento];
    return detalleBien?.unidad_medida || "";
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bienes Cotizados</h2>
          <div className="text-sm text-gray-600">
            Total de bienes cotizados: {bienesCotizados.length}
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {!iscreate && (
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                  >
                    Estado
                  </th>
                )}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ítem
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Marca
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cantidad Solicitada
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Precio Unitario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Precio Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bienesCotizados.length === 0 ? (
                <tr>
                  <td
                    colSpan={edit ? 8 : 7}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-gray-400">
                        <svg
                          className="w-12 h-12 mx-auto"
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
                      <p className="text-lg font-medium text-gray-900">
                        No hay bienes cotizados
                      </p>
                      <p className="text-sm text-gray-500">
                        Selecciona un bien para cotizar y aparecerá aquí
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {bienesCotizados.map((cotizacion, index) => {
                    const estadoConfig = getEstadoConfig(cotizacion.estado);
                    const EstadoIcon = estadoConfig?.icon;
                    
                    return (
                      <tr
                        key={cotizacion.idDetalleRequerimiento}
                        className="hover:bg-gray-50"
                      >
                        {!iscreate && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="relative inline-block">
                              <button
                                className={`p-2 rounded-lg border transition-all duration-200 ${estadoConfig.color}`}
                                onMouseEnter={() => setHoveredEstado(cotizacion.idDetalleRequerimiento!)}
                                onMouseLeave={() => setHoveredEstado(null)}
                                title={estadoConfig.label}
                              >
                                <EstadoIcon className={`h-4 w-4 ${estadoConfig.iconColor}`} />
                              </button>
                              {hoveredEstado === cotizacion.idDetalleRequerimiento && (
                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap shadow-lg">
                                  {estadoConfig.label}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">
                            {getBienNombre(cotizacion.idDetalleRequerimiento!)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getBienMarca(cotizacion.idDetalleRequerimiento!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium">
                            {cotizacion.cantidad}{" "}
                            {getUnidadMedida(cotizacion.idDetalleRequerimiento!)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium">
                            {getCurrencySymbol()} {(cotizacion.precioUnitario || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-green-600">
                            {getCurrencySymbol()} {calcularPrecioTotal(cotizacion).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditModalClick(cotizacion)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                              title="Ver/Editar cotización"
                            >
                              <Info size={16} />
                            </button>
                            {edit && (
                              <button
                                onClick={() =>
                                  handleDeleteConfirm(
                                    cotizacion.idDetalleRequerimiento!
                                  )
                                }
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="Eliminar cotización"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fila de totales */}
                  <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                    <td
                      colSpan={edit ? 6 : 5}
                      className="px-6 py-4 text-right text-sm text-gray-900"
                    >
                      <strong>SubTotal General:</strong>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-lg font-bold text-green-600">
                        {getCurrencySymbol()} {calcularTotalGeneral().toFixed(2)}
                      </span>
                    </td>
                    <td colSpan={1}></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para editar cotización */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title="Editar Cotización"
        subtitle={
          selectedCotizacion
            ? getBienNombre(selectedCotizacion.idDetalleRequerimiento!)
            : ""
        }
        size="xl"
      >
        {selectedCotizacion && user && procuraId && (
          <FormCotizacionBien
            user={user}
            detalleBien={
              detallesBienesMap[selectedCotizacion.idDetalleRequerimiento!]
            }
            procuraId={procuraId}
            onSave={handleSaveCotizacion}
            onCancel={handleModalClose}
            edit={edit}
            editingCotizacion={selectedCotizacion}
            moneda={moneda}
          />
        )}
      </Modal>
    </>
  );
};

export default TablaBienesCotizados;