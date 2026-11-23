import React, { useState, useEffect } from "react";
import { Check, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { calcularStatsPorMesPagos } from "../data/mockData";
import { fetchFacturas, fetchPagos } from "../data/api";
import { Factura, Pago } from "../data/models";
import { DashboardCard } from "../components/ui/DashboardCard";
import { UsuarioProfile } from "../../data/models";

// Función para calcular datos mensuales con pagado y por pagar
const calcularDatosMensualesPagos = (pagos: Pago[], facturas: Factura[]) => {
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const monthlyData = meses.map((mes, index) => ({
    month: mes,
    pagado: 0,
    porPagar: 0,
  }));

  // Calcular montos pagados por mes
  pagos.forEach(pago => {
    if (!pago.fecha_pago) return;
    
    const fecha = new Date(pago.fecha_pago);
    if (isNaN(fecha.getTime())) return;

    const mesIndex = fecha.getMonth();
    monthlyData[mesIndex].pagado += pago.monto_pago;
  });

  // Calcular montos por pagar por mes (basado en fecha de vencimiento o emisión de facturas pendientes)
  const facturasPendientes = facturas.filter(
    f => f.estado_factura === "Pendiente" || f.estado_factura === "Aprobada" || f.estado_factura === "Pagando"
  );

  facturasPendientes.forEach(factura => {
    if (!factura.fecha_emision) return;
    
    const fecha = new Date(factura.fecha_emision);
    if (isNaN(fecha.getTime())) return;

    const mesIndex = fecha.getMonth();
    const montoPorPagar = factura.monto_total - (factura.monto_pagado || 0);
    monthlyData[mesIndex].porPagar += montoPorPagar;
  });

  return monthlyData;
};

export default function HomePagos() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const user: UsuarioProfile = JSON.parse(
    sessionStorage.getItem("user") || JSON.stringify("")
  );

  const COLORS = ["#FBBF24", "#3B82F6", "#EF4444", "#8B5CF6", "#10B981"];
  const statusData = [
    {
      name: "Pendiente",
      value: calcularStatsPorMesPagos(pagos, facturas).facturasPendientes,
      color: "#FBBF24",
    },
    {
      name: "Aprobadas",
      value: calcularStatsPorMesPagos(pagos, facturas).facturasAprobadas,
      color: "#3B82F6",
    },
    {
      name: "Rechazadas",
      value: calcularStatsPorMesPagos(pagos, facturas).facturasRechazadas,
      color: "#EF4444",
    },
    {
      name: "En pago",
      value: calcularStatsPorMesPagos(pagos, facturas).facturasEnPago,
      color: "#8B5CF6",
    },
    {
      name: "Pagadas",
      value: calcularStatsPorMesPagos(pagos, facturas).facturasPagadas,
      color: "#10B981",
    },
  ];

  const cargarPagos = async () => {
    setPagos(await fetchPagos(user.id));
  };

  const cargarFacturas = async () => {
    setFacturas(await fetchFacturas(user.id));
  };

  useEffect(() => {
    cargarPagos();
    cargarFacturas();
  }, [user.id]);

  // Obtener datos mensuales para el gráfico de barras
  const monthlyPaymentData = calcularDatosMensualesPagos(pagos, facturas);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <DashboardCard
          title="Total Pagado S/."
          value={calcularStatsPorMesPagos(pagos, facturas).montoPagado}
          icon={<Check size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total por Pagar S/."
          value={calcularStatsPorMesPagos(pagos, facturas).montoPendiente}
          icon={<AlertTriangle size={20} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Actividad de Pagos
          </h2>
          <div className="h-72 overflow-x-auto">
            <ResponsiveContainer width={800} height="100%">
              <BarChart
                data={monthlyPaymentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `S/.${value}`, 
                    name === ''
                  ]} 
                />
                <Legend />
                <Bar 
                  dataKey="pagado" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  name="Pagado"
                />
                <Bar 
                  dataKey="porPagar" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                  name="Por Pagar"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Estado de Facturas
          </h2>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) =>
                    `${''} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Facturas"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}