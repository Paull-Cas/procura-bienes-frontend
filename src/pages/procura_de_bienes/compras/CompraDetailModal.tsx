import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Download,
  Package,
  User,
  Mail,
  Hash,
  MapPin,
} from "lucide-react";
import { Compra, DetalleCompra } from "./data/models";
import { fetchDetalleCompra } from "./data/api";

interface CompraDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  compra: Compra | null;
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

export default function CompraDetailModal({
  isOpen,
  onClose,
  compra,
}: CompraDetailModalProps) {
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && compra?.idCompra) {
      setLoading(true);
      fetchDetalleCompra(compra.idCompra)
        .then(setDetalles)
        .catch(() => setDetalles([]))
        .finally(() => setLoading(false));
    } else {
      setDetalles([]);
    }
  }, [isOpen, compra]);

  const total = detalles.reduce(
    (acc, d) => acc + (d.precioCompra ?? 0) * (d.cantidadComprada ?? 0),
    0
  );

  const descargarContrato = () => {
    if (!compra?.documentoCompra) return;
    const bytes = atob(compra.documentoCompra);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato-${compra.codigoOrdenCompra || "OC"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!compra) return null;

  const infoRow = (
    Icon: typeof Building2,
    color: string,
    label: string,
    value?: string | number | null
  ) => (
    <div className="flex items-start gap-2 text-sm">
      <Icon size={15} className={`${color} flex-shrink-0 mt-0.5`} />
      <span className="font-medium text-gray-500">{label}:</span>
      <span className="text-gray-800">{value || "—"}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la Orden de Compra" size="lg">
      <div className="space-y-5">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600">
              <Package size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{compra.codigoOrdenCompra}</p>
              <p className="text-xs text-gray-400">Orden de compra</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estiloEstado(
              compra.estado
            )}`}
          >
            {compra.estado}
          </span>
        </div>

        {/* Datos del proveedor / OC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-gray-50 rounded-lg p-4">
          {infoRow(Building2, "text-blue-600", "Empresa", compra.nombreEmpresa)}
          {infoRow(Hash, "text-purple-600", "RUC", compra.ruc)}
          {infoRow(MapPin, "text-red-500", "Dirección", compra.direccion)}
          {infoRow(Mail, "text-cyan-600", "Email", compra.email)}
          {infoRow(User, "text-indigo-600", "Gestor", compra.gestorCompra)}
          {infoRow(Calendar, "text-orange-500", "Fecha compra", compra.fechaCompra)}
          {infoRow(Clock, "text-amber-600", "Entrega (min–max)", `${compra.plazoMinEntrega || "—"} → ${compra.plazoMaxEntrega || "—"}`)}
          {infoRow(DollarSign, "text-green-600", "Forma de pago", compra.formaPago)}
        </div>

        {/* Ítems */}
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Package size={18} className="text-orange-500" />
            Ítems de la orden
          </h3>
          {loading ? (
            <p className="text-gray-500 text-sm py-4 text-center">Cargando ítems...</p>
          ) : detalles.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Sin ítems.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-orange-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Ítem</th>
                    <th className="text-right px-3 py-2 font-medium">Cantidad</th>
                    <th className="text-right px-3 py-2 font-medium">P. Unitario</th>
                    <th className="text-right px-3 py-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d, i) => (
                    <tr key={d.idDetalleCompra} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-700">#{i + 1}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{d.cantidadComprada}</td>
                      <td className="px-3 py-2 text-right text-gray-700">
                        S/ {d.precioCompra}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">
                        S/ {(d.precioCompra ?? 0) * (d.cantidadComprada ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-orange-200 bg-orange-50/50">
                    <td colSpan={3} className="px-3 py-2 text-right font-semibold text-gray-700">
                      Total
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-green-700">S/ {total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Documento / contrato */}
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <FileText size={18} className="text-orange-500" />
            Documento (contrato)
          </h3>
          {compra.documentoCompra ? (
            <button
              onClick={descargarContrato}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 cursor-pointer"
            >
              <Download size={16} /> Descargar contrato
            </button>
          ) : (
            <p className="text-gray-400 text-sm italic">
              No se adjuntó documento en esta orden.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
