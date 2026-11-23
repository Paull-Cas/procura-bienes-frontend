import { useEffect, useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Search, Filter, Info, Trash2, FileText } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import { Factura } from "../../data/models";
import Confirmacion from "../../../components/Confirmacion";
import { deleteFactura } from "../../data/api";
import { UsuarioProfile } from "../../../data/models";
import Toast from "../../../components/Toast";
import FacturaDetailModal from "./modals/FacturaDetailModal";

interface ListaFacturasProps {
  user: UsuarioProfile;
  facturas: Factura[];
  onFacturasCargar: () => void;
}

export default function ListaFacturas({
  facturas,
  user,
  onFacturasCargar,
}: ListaFacturasProps) {
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isFacturaDetailModalOpen, setIsFacturaDetailModalOpen] =
    useState(false);

  const [facturaToDelete, setFacturaToDelete] = useState<Factura | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura>();

  const [permisos, setPermisos] = useState<string[]>([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleConfirmarEliminar = async () => {
    if (facturaToDelete) {
      await deleteFactura(facturaToDelete.id_factura);
      setShowConfirmacion(false);
      setFacturaToDelete(null);

      setToastMessage("¡Factura eliminada exitosamente!");
      setToastType("success");
      setShowToast(true);
      onFacturasCargar();
    }
  };

  useEffect(() => {
    setPermisos(user.permisos.map((p) => p.codigoPermiso));
    onFacturasCargar();
  }, [isFacturaDetailModalOpen]);

  const permisosActualizar = useMemo(
    () =>
      permisos.filter(
        (p) => p === "INV_UPDATE" || p === "INV_EVALUATE"
      ),
    [permisos]
  );

  const permisoEliminar = useMemo(
    () => permisos.includes("INV_DELETE"),
    [permisos]
  );

  // Filtrado
  const filteredFacturas = facturas.filter((factura) => {
    const matchesSearchTerm = factura.titulo
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesEstado =
      factura.estado_factura
        ?.toLowerCase()
        .includes(statusFilter.toLowerCase()) || !statusFilter;

    return matchesSearchTerm && matchesEstado;
  });

  const handleVerDetalles = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsFacturaDetailModalOpen(true);
  };

  // Formato de moneda personalizado
  const monedaFormato = (amount: number, currency: string) => {
    const formattedAmount = new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${currency} ${formattedAmount}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Buscador */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar facturas por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro de estado */}
        <div className="flex items-center">
          <div className="relative inline-block text-left">
            <div className="flex items-center">
              <Filter size={18} className="text-gray-400 mr-1" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Aprobada">Aprobadas</option>
                <option value="Pagada">Pagadas</option>
                <option value="Rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Factura #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Título
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Monto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha de Emisión
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha Límite
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFacturas.length > 0 ? (
              filteredFacturas.map((factura, index) => {
                return (
                  <tr key={factura.id_factura} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {factura.titulo || "Sin título"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {monedaFormato(factura.monto_total, factura.moneda)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {format(parseISO(factura.fecha_emision), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {format(parseISO(factura.fecha_limite), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <StatusBadge
                          status={factura.estado_factura ?? "ninguno"}
                          type="factura"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        {permisosActualizar.length > 0 && (
                          <button
                            className="text-blue-600 hover:text-blue-900 focus:outline-none p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Ver Detalle Factura"
                            onClick={() => handleVerDetalles(factura)}
                          >
                            <Info size={18} />
                          </button>
                        )}
                        {permisoEliminar && factura.estado_factura === 'Pendiente' && (
                          <button
                            className="text-red-400 hover:text-red-600 focus:outline-none p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Eliminar Factura"
                            onClick={() => {
                              setFacturaToDelete(factura);
                              setShowConfirmacion(true);
                            }}
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    No se encontraron facturas
                  </h3>
                  <p className="text-gray-500">
                    Intenta ajustar los filtros o crear una nueva factura.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Confirmacion
        isOpen={showConfirmacion}
        onClose={() => {
          setShowConfirmacion(false);
          setFacturaToDelete(null);
        }}
        onConfirm={handleConfirmarEliminar}
        title="Confirmar eliminación"
        message={`¿Estás seguro que deseas eliminar la factura "${facturaToDelete?.titulo}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
      {selectedFactura && (
        <FacturaDetailModal
          user={user}
          isOpen={isFacturaDetailModalOpen}
          onClose={() => setIsFacturaDetailModalOpen(false)}
          factura={selectedFactura as Factura}
        />
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={1000}
        />
      )}
    </div>
  );
}
