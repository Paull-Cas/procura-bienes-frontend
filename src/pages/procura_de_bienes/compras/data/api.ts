import { Compra, DetalleCompra, OfertaCotizada } from "./models";
import { API_BASE } from "../../../../api_base";
import { getToken } from "../../../../api_base";

// Comparativo de ofertas aceptadas técnicamente de una procura (para armar el carrito)
export const fetchComparativo = async (
  idProcura: number
): Promise<OfertaCotizada[]> => {
  const response = await fetch(`${API_BASE}/procura/${idProcura}/comparativo`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return (data.object as OfertaCotizada[]) || [];
};

// Emite una orden de compra (una por proveedor) con los ítems seleccionados
export const createCompra = async (
  compra: Compra,
  bienesComprados: DetalleCompra[]
) => {
  const payload = {
    compra: {
      idCotizacion: compra.idCotizacion,
      fechaCompra: compra.fechaCompra,
      gestorCompra: compra.gestorCompra,
      nombreEmpresa: compra.nombreEmpresa,
      direccion: compra.direccion,
      ruc: compra.ruc,
      email: compra.email,
      formaPago: compra.formaPago,
      plazoMinEntrega: compra.plazoMinEntrega,
      plazoMaxEntrega: compra.plazoMaxEntrega,
      nota: compra.nota,
      descuento: compra.descuento,
      precioSubtotal: compra.precioSubtotal,
      documentoCompra: compra.documentoCompra,
    },
    bienesComprados: bienesComprados.map((detalle) => ({
      idDetalleCotizacion: detalle.idDetalleCotizacion,
      cantidadComprada: detalle.cantidadComprada,
      precioCompra: detalle.precioCompra,
      observaciones: detalle.observaciones || "",
    })),
  };

  const response = await fetch(`${API_BASE}/compra/guardar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const mensaje = await response.text();
    throw new Error(mensaje || "Error al emitir la orden de compra");
  }

  return await response.text();
};

// Historial de órdenes de compra (encargado de compras)
export const fetchCompras = async (idUsuario: number): Promise<Compra[]> => {
  const response = await fetch(`${API_BASE}/compra/todos?idUsuario=${idUsuario}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return (data as Compra[]) || [];
};

// Órdenes de compra del proveedor autenticado (bandeja "Mis Órdenes")
export const fetchComprasPorProveedor = async (
  idUsuario: number
): Promise<Compra[]> => {
  const response = await fetch(
    `${API_BASE}/compra/por-proveedor?idUsuario=${idUsuario}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data as Compra[]) || [];
};

export const fetchDetalleCompra = async (
  idCompra: number
): Promise<DetalleCompra[]> => {
  const response = await fetch(
    `${API_BASE}/detalle-compra/todos?idCompra=${idCompra}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data as DetalleCompra[]) || [];
};

// El proveedor acepta la orden de compra
export const aceptarCompra = async (idCompra: number) => {
  const response = await fetch(`${API_BASE}/compra/aceptar/${idCompra}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    const mensaje = await response.text();
    throw new Error(mensaje || "Error al aceptar la orden de compra");
  }
};
