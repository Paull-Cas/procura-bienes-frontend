import { useEffect, useState } from "react";
import { Search, ShoppingCart, Calendar, Building2, DollarSign, ChevronRight, FileText } from "lucide-react";
import { UsuarioProfile } from "../../data/models";
import { Compra } from "./data/models";
import { fetchCompras } from "./data/api";
import CompraDetailModal from "./CompraDetailModal";

interface HistorialComprasProps {
  user: UsuarioProfile;
}

const estiloEstado = (estado?: string) => {
  switch (estado) {
    case "Aceptada":
      return "bg-emerald-100 text-emerald-700";
    case "Emitida":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function HistorialCompras({ user }: HistorialComprasProps) {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEst, setSearchEst] = useState("");
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const verDetalle = (compra: Compra) => {
    setSelectedCompra(compra);
    setShowDetail(true);
  };

  const cargarCompras = async () => {
    setCompras(await fetchCompras(user.id));
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  const comprasFiltradas = compras.filter((compra) => {
    const matchesSearch = compra.codigoOrdenCompra
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEstado = compra.estado
      ?.toLowerCase()
      .includes(searchEst.toLowerCase());
    return (matchesSearch ?? true) && (matchesEstado ?? true);
  });

  return (
    <div className="rounded-lg pb-2">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="text-orange-600" size={28} />
          Historial de Compras
        </h2>
        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm">
          <Search className="text-orange-500 ml-3" size={20} />
          <input
            type="text"
            placeholder="Buscar por código de orden..."
            className="w-full p-2.5 outline-none rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm">
          <select
            className="w-full p-2.5 rounded-lg outline-none cursor-pointer"
            onChange={(e) => setSearchEst(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Emitida">Emitidas</option>
            <option value="Aceptada">Aceptadas</option>
          </select>
        </div>
      </div>

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comprasFiltradas.map((compra) => (
          <button
            key={compra.idCompra}
            onClick={() => verDetalle(compra)}
            className="group relative text-left bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600" />
            <div className="p-4 pl-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <ShoppingCart size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                    {compra.codigoOrdenCompra}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${estiloEstado(
                      compra.estado
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        compra.estado === "Aceptada" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {compra.estado}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 flex-shrink-0 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span className="truncate">{compra.nombreEmpresa || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                  <span>{compra.fechaCompra || "—"}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1 font-semibold text-green-700">
                    <DollarSign size={15} className="text-green-600" />
                    S/ {compra.precioSubtotal ?? 0}
                  </span>
                  {compra.documentoCompra && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                      <FileText size={13} /> Contrato
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
        {comprasFiltradas.length === 0 && (
          <div className="col-span-full text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingCart className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No hay órdenes de compra registradas
            </p>
          </div>
        )}
      </div>

      <CompraDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        compra={selectedCompra}
      />
    </div>
  );
}
