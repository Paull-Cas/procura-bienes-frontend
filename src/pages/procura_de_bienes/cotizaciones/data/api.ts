import { Cotizacion, DetalleCotizacion } from "./models";
import { API_BASE } from "../../../../api_base";
import { getToken } from "../../../../api_base";

export const createCotizacion = async (
  cotizacion: Cotizacion,
  detalles: DetalleCotizacion[]
) => {
  try {
    const payload = {
      cotizacion: {
        idProcura: cotizacion.idProcura,
        idUsuario: cotizacion.idUsuario,
        numeroCotizacion: cotizacion.numeroCotizacion,
        servicioOfertado: cotizacion.servicioOfertado,
        moneda: cotizacion.moneda,
        garantia: cotizacion.garantia,
        formaPago: cotizacion.formaPago,
        plazoMinEntrega: cotizacion.plazoMinEntrega,
        plazoMaxEntrega: cotizacion.plazoMaxEntrega,
        notas: cotizacion.notas,
        informacionPago: cotizacion.informacionPago,
        documentoCotizacion: cotizacion.documentoCotizacion,
        fechaCotizacion: cotizacion.fechaCotizacion,
        fechaLimiteCompra: cotizacion.fechaLimiteCompra,
        estado: cotizacion.estado,
        precioSubtotal: cotizacion.precioSubtotal,
        personaContacto: cotizacion.personaContacto,
        telefonoMovil: cotizacion.telefonoMovil,
        telefonoOficina: cotizacion.telefonoOficina,
        email: cotizacion.email,
        incluyeIgv: cotizacion.incluyeIgv,
        incluyeCostosTransporte: cotizacion.incluyeCostosTransporte,
        costosTransporte: cotizacion.costosTransporte,
      },
      bienescotizados: detalles.map((detalle) => ({
        idDetalleRequerimiento: detalle.idDetalleRequerimiento,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        estado: detalle.estado,
        fichaTecnica: detalle.fichaTecnica,
        brindaCertificadoCalidad: detalle.brindaCertificadoCalidad,
      })),
    };

    const response = await fetch(`${API_BASE}/cotizacion/guardar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("No se pudo registrar la cotización");
    }

    const result = await response.json();

    return {
      success: true,
      titulo: result.object as string,
    };
  } catch (error) {
    console.error("Error creating cotizacion:", error);
    throw error;
  }
};

export const fetchCotizaciones = async (
  idUsuario: number
): Promise<Cotizacion[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/cotizacion/todos?idUsuario=${idUsuario}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No se encontraron cotizaciones");
        return [];
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.object || !Array.isArray(data.object)) {
      console.log("No hay cotizaciones disponibles");
      return [];
    }

    const obj: Cotizacion[] = data.object;
    return obj;
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    if (
      error instanceof Error &&
      (error.message.includes("404") || error.name === "NetworkError")
    ) {
      return [];
    }
    throw error;
  }
};

export const fetchCotizacionByProveedorAndProcura = async (
  idUsuario: number,
  idProcura: number
): Promise<Cotizacion | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/cotizacion/por-procura-proveedor?idUsuario=${idUsuario}&idProcura=${idProcura}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    // Si no encuentra la cotización (404), retornar null
    if (!response.ok) {
      if (response.status === 404) {
        console.log(
          "No se encontró cotización existente para este proveedor y procura"
        );
        return null;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar si el objeto existe y tiene datos
    if (!data.object) {
      return null;
    }

    const obj: Cotizacion = data.object;
    return obj;
  } catch (error) {
    console.error("Error al obtener cotización:", error);
    if (
      error instanceof Error &&
      (error.message.includes("404") || error.name === "NetworkError")
    ) {
      return null;
    }
    throw error;
  }
};

export const fetchDetalleCotizacion = async (
  idCotizacion: number
): Promise<DetalleCotizacion[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/detalle-cotizacion/todos?idCotizacion=${idCotizacion}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No se encontraron detalles para esta cotización");
        return [];
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar si el array existe
    if (!data.object || !Array.isArray(data.object)) {
      console.log("No hay detalles de cotización disponibles");
      return [];
    }

    const obj: DetalleCotizacion[] = data.object;
    return obj;
  } catch (error) {
    console.error("Error al obtener detalles de cotización:", error);
    // Si es un error de red o 404, retornar array vacío
    if (
      error instanceof Error &&
      (error.message.includes("404") || error.name === "NetworkError")
    ) {
      return [];
    }
    throw error;
  }
};

export const updateCotizacion = async (
  idCotizacion: number,
  cotizacion: Cotizacion,
  detalles: DetalleCotizacion[]
) => {
  const cotizacionAPI = {
    idProcura: cotizacion.idProcura,
    idUsuario: cotizacion.idUsuario,
    numeroCotizacion: cotizacion.numeroCotizacion,
    servicioOfertado: cotizacion.servicioOfertado,
    moneda: cotizacion.moneda,
    garantia: cotizacion.garantia,
    formaPago: cotizacion.formaPago,
    plazoMinEntrega: cotizacion.plazoMinEntrega,
    plazoMaxEntrega: cotizacion.plazoMaxEntrega,
    notas: cotizacion.notas,
    informacionPago: cotizacion.informacionPago,
    documentoCotizacion: cotizacion.documentoCotizacion,
    fechaCotizacion: cotizacion.fechaCotizacion,
    fechaLimiteCompra: cotizacion.fechaLimiteCompra,
    estado: cotizacion.estado,
    precioSubtotal: cotizacion.precioSubtotal,
    personaContacto: cotizacion.personaContacto,
    telefonoMovil: cotizacion.telefonoMovil,
    telefonoOficina: cotizacion.telefonoOficina,
    email: cotizacion.email,
    incluyeIgv: cotizacion.incluyeIgv,
    incluyeCostosTransporte: cotizacion.incluyeCostosTransporte,
    costosTransporte: cotizacion.costosTransporte,
  };

  const detallesAPI = detalles.map((detalle) => ({
    idCotizacion: idCotizacion,
    idDetalleRequerimiento: detalle.idDetalleRequerimiento,
    cantidad: detalle.cantidad,
    precioUnitario: detalle.precioUnitario,
    estado: detalle.estado,
    fichaTecnica: detalle.fichaTecnica,
    brindaCertificadoCalidad: detalle.brindaCertificadoCalidad,
  }));

  await fetch(`${API_BASE}/cotizacion/${idCotizacion}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cotizacionAPI),
  });

  await fetch(
    `${API_BASE}/detalle-cotizacion/actualizar/${idCotizacion}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detallesAPI),
    }
  );
};


export const sendEvaluationCotizacion = async (
  idCotizacion: number,
  evaluaciones: any[]
) => {
  try {
    const response = await fetch(
      `${API_BASE}/detalle-cotizacion/enviar-evaluacion/${idCotizacion}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluaciones),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error al enviar evaluación de cotización:", error);
    throw error;
  }
};


export const deleteCotizacion = async (idCotizacion: number) => {
  try {
    const response = await fetch(
      `${API_BASE}/cotizacion/${idCotizacion}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar cotización:", error);
    throw error;
  }
};
