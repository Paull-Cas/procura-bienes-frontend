import { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  CircleDollarSign,
  FileText,
  ReceiptText,
  Filter,
  Search,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Pago } from "../../data/models";
import { UsuarioProfile } from "../../../data/models";
import { FileData } from "../../../data/models";
import { useFileActions } from "../../../components/useFileActions";
import FileViewerModal from "../../../components/FileViewerModal";

interface ListaPagosProps {
  user: UsuarioProfile;
  pagos: Pago[];
}

export default function ListaPagos({ pagos }: ListaPagosProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [archivoActual, setArchivoActual] = useState<FileData | null>(null);
  
  const { handleViewFile } = useFileActions(setArchivoActual, setModalOpen);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const getPaymentTypeColor = (type: string) => {
    return type === "Factura"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getFileName = (pago: Pago) => {
    if (!pago.titulo) return `pago_${pago.id_pago}`;

    const cleanTitle = pago.titulo
      .replace(/[^a-z0-9áéíóúñü\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    return cleanTitle;
  };

  const handleViewPago = (pago: Pago) => {
    if (pago.comprobante_file) {
      handleViewFile(pago.comprobante_file, getFileName(pago));
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setArchivoActual(null);
  };

  if (pagos.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No hay pagos registrados
        </h3>
        <p className="text-gray-500">
          Los pagos aparecerán aquí una vez que sean registrados.
        </p>
      </div>
    );
  }

  const filteredPagos = pagos.filter((pago) => {
    const matchesSearchTerm = pago.titulo
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesEstado =
      pago.tipo_pago?.toLowerCase().includes(statusFilter.toLowerCase()) ||
      !statusFilter;

    return matchesSearchTerm && matchesEstado;
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden p-3">
        <div className="mb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar Pagos por título..."
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
                  <option value="Factura">Factura</option>
                  <option value="Detracción">Detracción</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {filteredPagos.map((pago) => (
            <div
              key={pago.id_pago}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {pago.titulo}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-600" />
                      <span>
                        {format(parseISO(pago.fecha_pago), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CircleDollarSign size={14} className="text-green-600" />
                      <span className="font-medium">
                        {formatCurrency(pago.monto_pago)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    className="text-orange-600 bg-orange-50 hover:text-orange-900 focus:outline-none p-1 rounded-full hover:bg-orange-100 transition-colors"
                    title="Ver Archivo de Pago"
                    onClick={() => handleViewPago(pago)}
                    disabled={!pago.comprobante_file}
                  >
                    <div className="flex items-center text-xs gap-2">
                      <h3 className="pr-1 pl-1">Ver Pago</h3>
                      <ReceiptText size={15} />
                    </div>
                  </button>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(
                      pago.tipo_pago
                    )}`}
                  >
                    {pago.tipo_pago}
                  </span>
                </div>
              </div>

              {pago.descripcion && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-1">
                    <FileText size={14} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Descripción:
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {pago.descripcion}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="text-yellow-600">
                  Cargado:{" "}
                  {format(
                    parseISO(
                      pago.fecha_carga ? pago.fecha_carga : pago.fecha_pago
                    ),
                    "dd/MM/yyyy"
                  )}
                </span>
                {pago.proximo_pago_estimado && (
                  <span className="text-sky-600">
                    Próximo pago estimado:{" "}
                    {format(parseISO(pago.proximo_pago_estimado), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal de visualización de archivos */}
      <FileViewerModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        fileData={archivoActual}
      />
    </>
  );
}