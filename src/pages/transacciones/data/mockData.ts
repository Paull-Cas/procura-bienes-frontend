
import { Factura, Pago } from "./models";

const meses = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const calcularStatsPorMesFacturas = (facturas: Factura[]) => {
  const monthlyData = meses.map((mes) => ({
    month: mes,
    invoices: 0,
    amount: 0,
  }));

  facturas.forEach((factura) => {
    if (!factura.fecha_emision) return;

    const fecha = new Date(factura.fecha_emision);
    if (isNaN(fecha.getTime())) return;

    const mesIndex = fecha.getMonth();
    monthlyData[mesIndex].invoices += 1;
    monthlyData[mesIndex].amount += factura.monto_total;
  });

  return monthlyData;
};

export const calcularStatsPorMesPagos = (
  pagos: Pago[],
  facturas: Factura[]
) => {
  // Filtrar facturas válidas (excluyendo rechazadas)
  const facturasValidas = facturas.filter(
    f => f.estado_factura !== "Rechazada"
  );

  // Calcular estadísticas de facturas
  const facturasTotal = facturas.length;
  const facturasPendientes = facturas.filter(
    (f) => f.estado_factura === "Pendiente"
  ).length;
  const facturasAprobadas = facturas.filter(
    (f) => f.estado_factura === "Aprobada"
  ).length;
  const facturasRechazadas = facturas.filter(
    (f) => f.estado_factura === "Rechazada"
  ).length;
  const facturasEnPago = facturas.filter(
    (f) => f.estado_factura === "Pagando"
  ).length;
  const facturasPagadas = facturas.filter(
    (f) => f.estado_factura === "Pagada"
  ).length;

  // Calcular montos usando solo facturas válidas (no rechazadas)
  const montoTotal = facturasValidas.reduce(
    (sum, f) => sum + f.monto_total, 
    0
  );
  
  // Calcular monto pagado usando la tabla de pagos
  const montoPagado = facturasValidas.reduce(
    (sum, f) => sum + (f.monto_pagado || 0),
    0
  );
  
  // Calcular monto pendiente: solo para facturas pendientes o en pago
  const montoPendiente = montoTotal - montoPagado;

  // Calcular datos mensuales de pagos
  const monthlyDataPagos = meses.map((mes) => ({
    month: mes,
    invoices: 0,
    amount: 0,
  }));

  pagos.forEach(pago => {
    if (!pago.fecha_pago) return;
    
    const fecha = new Date(pago.fecha_pago);
    if (isNaN(fecha.getTime())) return;

    const mesIndex = fecha.getMonth();
    monthlyDataPagos[mesIndex].invoices += 1;
    monthlyDataPagos[mesIndex].amount += pago.monto_pago;
  });

  return {
    facturasTotal,
    facturasPendientes,
    facturasAprobadas,
    facturasRechazadas,
    facturasEnPago,
    facturasPagadas,
    montoTotal,
    montoPendiente,
    montoPagado,
    monthlyData: monthlyDataPagos,
  };
};