import { useEffect, useState } from "react";
import { PackageCheck, Calendar, DollarSign, Check, ChevronRight, FileText, Package } from "lucide-react";
import Toast from "../../components/Toast";
import Confirmacion from "../../components/Confirmacion";
import { UsuarioProfile } from "../../data/models";
import { Compra } from "./data/models";
import { fetchComprasPorProveedor, aceptarCompra } from "./data/api";
import CompraDetailModal from "./CompraDetailModal";

interface MisOrdenesProps {
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

export default function MisOrdenes({ user }: MisOrdenesProps) {
  const [ordenes, setOrdenes] = useState<Compra[]>([]);
  const [ordenAceptar, setOrdenAceptar] = useState<Compra | null>(null);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const cargarOrdenes = async () => {
    setOrdenes(await fetchComprasPorProveedor(user.id));
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const confirmarAceptar = async () => {
    if (!ordenAceptar) return;
    try {
      await aceptarCompra(ordenAceptar.idCompra!);
      setToastMessage("Orden de compra aceptada. Ya puedes cargar su factura.");
      setToastType("success");
      setShowToast(true);
      await cargarOrdenes();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setToastMessage(`Error al aceptar la orden: ${message}`);
      setToastType("error");
      setShowToast(true);
    } finally {
      setShowConfirmacion(false);
      setOrdenAceptar(null);
    }
  };

  return (
    <div className="rounded-lg pb-2">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl flex items-center mb-6 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <PackageCheck className="text-orange-600" size={28} />
          Mis Órdenes de Compra
        </h2>
      </div>

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordenes.map((orden) => (
          <div
            key={orden.idCompra}
            onClick={() => {
              setSelectedCompra(orden);
              setShowDetail(true);
            }}
            className="group relative bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600" />
            <div className="p-4 pl-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Package size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                    {orden.codigoOrdenCompra}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${estiloEstado(
                      orden.estado
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        orden.estado === "Aceptada" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {orden.estado}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 flex-shrink-0 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                  <span>{orden.fechaCompra || "—"}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-green-700">
                    <DollarSign size={15} className="text-green-600" />
                    S/ {orden.precioSubtotal ?? 0}
                  </span>
                  {orden.documentoCompra && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                      <FileText size={13} /> Contrato
                    </span>
                  )}
                </div>
              </div>

              {orden.estado === "Emitida" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOrdenAceptar(orden);
                    setShowConfirmacion(true);
                  }}
                  className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-orange-700 cursor-pointer"
                >
                  <Check size={16} /> Aceptar orden
                </button>
              )}
            </div>
          </div>
        ))}
        {ordenes.length === 0 && (
          <div className="col-span-full text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <PackageCheck className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No tienes órdenes de compra asignadas
            </p>
          </div>
        )}
      </div>

      <CompraDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        compra={selectedCompra}
      />

      <Confirmacion
        isOpen={showConfirmacion}
        onClose={() => {
          setShowConfirmacion(false);
          setOrdenAceptar(null);
        }}
        onConfirm={confirmarAceptar}
        title="Aceptar Orden de Compra"
        message={`¿Aceptar la orden de compra ${ordenAceptar?.codigoOrdenCompra}?`}
        confirmText="Aceptar"
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
