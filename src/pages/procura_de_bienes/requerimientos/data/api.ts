import { Bien, DetalleBien, Requerimiento, RequerimientoCard } from "./models";
import { API_BASE } from "../../../../api_base";
import { getToken } from "../../../../api_base";

export const createRequerimiento = async (
  requerimiento: Omit<Requerimiento, "titulo" | "tipo_requerimiento">,
  bienes: DetalleBien[]
) => {
  try {
    const payload = {
      requerimiento: {
        idUsuario: requerimiento.id_usuario,
        obra: requerimiento.obra,
        descripcion: requerimiento.descripcion,
        fechaMaximaAbastecimiento: requerimiento.fecha_maxima,
      },
      bienes: bienes.map((bien) => ({
        idBien: bien.id_bien,
        marca: bien.marca,
        unidadMedida: bien.unidad_medida,
        caracteristicaTecnica: bien.caracteristica_tecnica,
        cantidad: bien.cantidad,
        aplicaFichaTecnica: bien.aplica_ficha_tecnica,
        fichaTecnica: bien.ficha_tecnica || "",
        aplicaCertificadoCalidad: bien.aplica_certificado_calidad,
        certificadoCalidad: bien.certificado_calidad || "",
      })),
    };

    const response = await fetch(`${API_BASE}/requerimiento/guardar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || "Error creando requerimientos");
    }

    const result = await response.json();

    // El backend ahora retorna una lista de títulos generados
    return {
      success: true,
      titulos: result.object as string[],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en creación de requerimiento:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const fetchBienes = async () => {
  const response = await fetch(`${API_BASE}/bien/todos`, {
    method: `GET`,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();
  return data.object.map(
    (bien: any): Bien => ({
      id_bien: bien.idBien,
      nombre: bien.nombre,
      descripcion: bien.descripcion,
      categoria: bien.categoria,
    })
  );
};

export const createBien = async (bien: Bien) => {
  const response = await fetch(`${API_BASE}/bien/guardar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bien),
  });
  if (!response.ok) throw new Error("Error al guardar el bien");
};

export const fetchRequerimientos = async (
  idUsuario: number
): Promise<RequerimientoCard[]> => {
  const response = await fetch(
    `${API_BASE}/requerimiento/todos?idUsuario=${idUsuario}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  return data.object.map(
    (requerimiento: any): RequerimientoCard => ({
      id_requerimiento: requerimiento.idRequerimiento,
      id_usuario: requerimiento.idUsuario,
      solicitante: requerimiento.solicitante,
      titulo: requerimiento.titulo,
      obra: requerimiento.obra,
      estado: requerimiento.estado,
      fecha_requerimiento: requerimiento.fechaRequerimiento,
      fecha_maxima_abastecimiento: requerimiento.fechaMaximaAbastecimiento,
    })
  );
};

export const deleteRequerimiento = async (idRequerimiento: number) => {
  await fetch(`${API_BASE}/requerimiento/${idRequerimiento}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const fetchRequerimiento = async (idRequerimiento?: number) => {
  const response = await fetch(`${API_BASE}/requerimiento/${idRequerimiento}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  const obj = data.object;

  return {
    id_requerimiento: obj.idRequerimiento,
    id_usuario: obj.idUsuario,
    titulo: obj.titulo,
    obra: obj.obra,
    tipo_requerimiento: obj.tipoRequerimiento,
    estado: obj.estado,
    descripcion: obj.descripcion,
    observaciones: obj.observaciones ?? "",
    fecha_requerimiento: obj.fechaRequerimiento,
    fecha_maxima: obj.fechaMaximaAbastecimiento,
  };
};

export const fetchDetalleRequerimiento = async (idRequerimiento?: number) => {
  const response = await fetch(
    `${API_BASE}/detalle-requerimiento/todos?idRequerimiento=${idRequerimiento}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();

  return data.object.map(
    (detreq: any): DetalleBien => ({
      id_detalle: detreq.idDetalleRequerimiento,
      id_bien: detreq.idBien,
      id_requerimiento: detreq.idRequerimiento,
      marca: detreq.marca,
      unidad_medida: detreq.unidadMedida,
      caracteristica_tecnica: detreq.caracteristicaTecnica,
      cantidad: detreq.cantidad,
      aplica_ficha_tecnica: detreq.aplicaFichaTecnica,
      aplica_certificado_calidad: detreq.aplicaCertificadoCalidad,
    })
  );
};

export const updateRequerimiento = async (
  requerimiento: Requerimiento,
  bienesList: DetalleBien[]
) => {
  const requerimientoAPI = {
    idUsuario: requerimiento.id_usuario,
    titulo: requerimiento.titulo,
    obra: requerimiento.obra,
    tipoRequerimiento: requerimiento.tipo_requerimiento,
    estado: requerimiento.estado,
    descripcion: requerimiento.descripcion,
    observaciones: requerimiento.observaciones,
    fechaMaximaAbastecimiento: requerimiento.fecha_maxima,
  } as { [key: string]: any };
  await fetch(`${API_BASE}/requerimiento/${requerimiento.id_requerimiento}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requerimientoAPI),
  });

  const bienesAPI = bienesList.map((bien) => ({
    idRequerimiento: requerimiento.id_requerimiento,
    idBien: bien.id_bien,
    marca: bien.marca,
    unidadMedida: bien.unidad_medida,
    caracteristicaTecnica: bien.caracteristica_tecnica,
    cantidad: bien.cantidad,
    aplicaFichaTecnica: bien.aplica_ficha_tecnica,
    fichaTecnica: bien.ficha_tecnica || "",
    aplicaCertificadoCalidad: bien.aplica_certificado_calidad,
    certificadoCalidad: bien.certificado_calidad || "",
  }));
  await fetch(
    `${API_BASE}/detalle-requerimiento/actualizar/${requerimiento.id_requerimiento}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bienesAPI),
    }
  );
};
