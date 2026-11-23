import { Factura, Pago } from "./models";
import { API_BASE } from "../../../api_base";
import { getToken } from "../../../api_base";

export const uploadFactura = async (factura: Factura) => {
  const payload = {
    idUsuario: factura.id_usuario,
    idOrdenOperativa: factura.id_orden_operativa,
    fechaEmision: factura.fecha_emision,
    fechaLimite: factura.fecha_limite,
    montoTotal: factura.monto_total,
    moneda: factura.moneda,
    facturaFile: factura.factura_file,
    descripcion: factura.descripcion || "",
    observacion: factura.observacion || "",
  };
  const response = await fetch(`${API_BASE}/factura/guardar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al subir la factura");
  }

  return response.json();
};

export const fetchFacturas = async (idUsuario: number) => {
  const response = await fetch(
    `${API_BASE}/factura/todos?idUsuario=${idUsuario}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  const data = await response.json();
  
  return data.object.map(
    (factura: any): Factura => ({
      id_factura: factura.idFactura,
      id_usuario: factura.idUsuario,
      nombre_usuario: factura.nombreUsuario,
      titulo: factura.titulo || "",
      fecha_emision: factura.fechaEmision,
      fecha_limite: factura.fechaLimite,
      fecha_carga: factura.fechaCarga,
      monto_total: factura.montoTotal,
      monto_pagado: factura.montoPagado || 0,
      moneda: factura.moneda,
      estado_factura: factura.estadoFactura,
      descripcion: factura.descripcion || "",
      observacion: factura.observacion || "",
      factura_file: factura.facturaFile || "",
    })
  );
};

export const fetchFactura = async (id_factura?: number) => {
  const response = await fetch(`${API_BASE}/factura/${id_factura}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();

  const obj = data.object;

  return {
    id_factura: obj.idFactura,
    id_usuario: obj.idUsuario,
    nombre_usuario: obj.nombreUsuario,
    titulo: obj.titulo || "",
    fecha_emision: obj.fechaEmision,
    fecha_limite: obj.fechaLimite,
    fecha_carga: obj.fechaCarga,
    monto_total: obj.montoTotal,
    monto_pagado: obj.montoPagado || 0,
    moneda: obj.moneda,
    estado_factura: obj.estadoFactura,
    descripcion: obj.descripcion || "",
    observacion: obj.observacion || "",
    factura_file: obj.facturaFile || "",
  };
};

export const updateFactura = async (factura: Factura) => {
  const facturaAPI = {
    idFactura: factura.id_factura,
    idUsuario: factura.id_usuario,
    titulo: factura.titulo,
    fechaEmision: factura.fecha_emision,
    fechaLimite: factura.fecha_limite,
    montoTotal: factura.monto_total,
    moneda: factura.moneda,
    estadoFactura: factura.estado_factura,
    descripcion: factura.descripcion || "",
    observacion: factura.observacion || "",
    facturaFile: factura.factura_file || "",
  };

  const response = await fetch(`${API_BASE}/factura/${factura.id_factura}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(facturaAPI),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar la factura");
  }

  return response.json();
};

export const deleteFactura = async (idFactura?: number) => {
  await fetch(`${API_BASE}/factura/${idFactura}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const uploadPago = async (pago: Pago) => {
  const payload = {
    idFactura: pago.id_factura,
    montoPago: pago.monto_pago,
    tipoPago: pago.tipo_pago,
    fechaPago: pago.fecha_pago,
    proximoPagoEstimado: pago.proximo_pago_estimado,
    comprobanteFile: pago.comprobante_file,
    descripcion: pago.descripcion || "",
  };

  const response = await fetch(`${API_BASE}/pago/guardar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.mensaje || "Error al guardar el pago");
  }

  return response.json();
};

export const fetchPagos = async (idUsuario: number) => {
  const response = await fetch(
    `${API_BASE}/pago/todos?idUsuario=${idUsuario}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  const data = await response.json();
  return data.object.map(
    (pago: any): Pago => ({
      id_pago: pago.idPago,
      titulo: pago.titulo || "",
      id_factura: pago.idFactura,
      monto_pago: pago.montoPago,
      tipo_pago: pago.tipoPago,
      fecha_pago: pago.fechaPago,
      fecha_carga: pago.fechaCarga,
      proximo_pago_estimado: pago.proximoPagoEstimado,
      comprobante_file: pago.comprobanteFile || "",
      descripcion: pago.descripcion || "",
    })
  );
};

export const fetchPagosPorFactura = async (idFactura: number) => {
  const response = await fetch(
    `${API_BASE}/pago/por-factura?idFactura=${idFactura}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  const data = await response.json();
  return data.object.map(
    (pago: any): Pago => ({
      id_pago: pago.idPago,
      titulo: pago.titulo || "",
      id_factura: pago.idFactura,
      monto_pago: pago.montoPago,
      tipo_pago: pago.tipoPago,
      fecha_pago: pago.fechaPago,
      fecha_carga: pago.fechaCarga,
      proximo_pago_estimado: pago.proximoPagoEstimado,
      comprobante_file: pago.comprobanteFile || "",
      descripcion: pago.descripcion || "",
    })
  );
};
