import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  Check,
  AlertTriangle,
  CreditCard,
  CircleFadingArrowUp,
  CircleCheck 
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { calcularStatsPorMesFacturas } from "../data/mockData";
import { fetchFacturas } from "../data/api";
import { Factura } from "../data/models";
import { DashboardCard } from "../components/ui/DashboardCard";
import { UsuarioProfile } from "../../data/models";

const monedaFormato = (amount: number, currency: string) => {
  const formattedAmount = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency} ${formattedAmount}`;
};

export default function HomeFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);

  const FacturasPendientes = facturas
    .filter((factura) => factura.estado_factura === "Pendiente")
    .slice(0, 3);
  const user: UsuarioProfile = JSON.parse(
    sessionStorage.getItem("user") || JSON.stringify("")
  );

  const cargarFacturas = async () => {
    setFacturas(await fetchFacturas(user.id));
  };

  useEffect(() => {
    cargarFacturas();
  }, [user.id]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        <DashboardCard
          title="Total Facturas"
          value={facturas.length}
          icon={<FileText size={20} />}
          color="orange"
        />
        <DashboardCard
          title="Facturas Pendientes"
          value={
            facturas.filter((f) => f.estado_factura === "Pendiente").length
          }
          icon={<Clock size={20} />}
          color="yellow"
        />
        <DashboardCard
          title="Facturas Aprobadas"
          value={
            facturas.filter((f) => f.estado_factura === "Aprobada").length
          }
          icon={<CircleCheck size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Facturas en Pago"
          value={
            facturas.filter((f) => f.estado_factura === "Pagando").length
          }
          icon={<CircleFadingArrowUp size={20} />}
          color="purple"
        />
        <DashboardCard
          title="Facturas Pagadas"
          value={facturas.filter((f) => f.estado_factura === "Pagada").length}
          icon={<Check size={20} />}
          color="green"
        />
        <DashboardCard
          title="Facturas Rechazadas"
          value={
            facturas.filter((f) => f.estado_factura === "Rechazada").length
          }
          icon={<AlertTriangle size={20} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Actividad de Facturas
          </h2>
          <div className="h-72 overflow-x-auto">
            <ResponsiveContainer width={800} height="100%">
              <BarChart
                data={calcularStatsPorMesFacturas(facturas)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`S/.${value}`, "Monto"]} />
                <Bar dataKey="amount" fill="#f29316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              Facturas Pendientes
            </h2>
          </div>

          {FacturasPendientes.length > 0 ? (
            <div className="space-y-4">
              {FacturasPendientes.map((factura) => (
                <div
                  key={factura.id_factura}
                  className="flex items-center p-3 bg-gray-50 rounded-md"
                >
                  <div className="p-2 bg-blue-100 rounded-md text-blue-700 mr-3">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {factura.titulo || "Sin título"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Monto:{" "}
                      {monedaFormato(factura.monto_total, factura.moneda)}
                    </p>
                  </div>
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No hay facturas pendientes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
