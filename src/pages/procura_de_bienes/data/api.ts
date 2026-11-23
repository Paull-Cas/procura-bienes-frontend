import { Procura } from "./models";
import { API_BASE } from "../../../api_base";
import { getToken } from "../../../api_base";

export const guardarProcura = async (procura: Procura) => {
    const payload = {
        idProcura: procura.id_procura,
        codigoProcura: procura.codigo_procura,
        idUsuario: procura.id_usuario,
        tipoRequerimiento: procura.tipo_requerimiento,
        estado: procura.estado,
        fechaMaximaCotizacion: procura.fecha_maxima_cotizacion,
        fechaMaximaAbastecimiento: procura.fecha_maxima_abastecimiento,
    };

  const response = await fetch(`${API_BASE}/procura/guardar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });
  return response.json();
};

export const fetchProcuras = async (idUsuario: number) => {
  const response = await fetch(
    `${API_BASE}/procura/todos?idUsuario=${idUsuario}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
  const data = await response.json();
  const listaProcuras = data.map(
    (procura: any): Procura => ({
      id_procura: procura.idProcura,
      codigo_procura: procura.codigoProcura,
      id_usuario: procura.idUsuario,
      tipo_requerimiento: procura.tipoRequerimiento,
      estado: procura.estado,
      fecha_maxima_cotizacion: procura.fechaMaximaCotizacion,
      fecha_maxima_abastecimiento: procura.fechaMaximaAbastecimiento,
    }
  )
  );
  return listaProcuras;
};

export const fetchProcuraById = async (idProcura: number) => {
  const response = await fetch(
    `${API_BASE}/procura/${idProcura}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
  const data = await response.json();
  return {
    id_procura: data.idProcura,
    codigo_procura: data.codigoProcura,
    id_usuario: data.idUsuario,
    tipo_requerimiento: data.tipoRequerimiento,
    estado: data.estado,
    fecha_maxima_cotizacion: data.fechaMaximaCotizacion,
    fecha_maxima_abastecimiento: data.fechaMaximaAbastecimiento,
  };
};

export const fetchProcurasNoCotizadas = async (idUsuario: number) => {
  const response = await fetch(
    `${API_BASE}/procura/no-cotizadas?idUsuario=${idUsuario}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
  const data = await response.json();
  const object = data.object;
  const listaProcuras = object.map(
    (procura: any): Procura => ({
      id_procura: procura.idProcura,
      codigo_procura: procura.codigoProcura,
      id_usuario: procura.idUsuario,
      tipo_requerimiento: procura.tipoRequerimiento,
      estado: procura.estado,
      fecha_maxima_cotizacion: procura.fechaMaximaCotizacion,
      fecha_maxima_abastecimiento: procura.fechaMaximaAbastecimiento,
    }
  )
  );
  return listaProcuras;
};

export const fetchRequerimientoByTitulo = async (titulo: string) => {
  const response = await fetch(
    `${API_BASE}/requerimiento/por-titulo/${titulo}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
    const data = await response.json();

  return {
    id_requerimiento: data.idRequerimiento,
    id_usuario: data.idUsuario,
    titulo: data.titulo,
    obra: data.obra,
    tipo_requerimiento: data.tipoRequerimiento,
    estado: data.estado,
    descripcion: data.descripcion,
    observaciones: data.observaciones ?? "",
    fecha_requerimiento: data.fechaRequerimiento,
    fecha_maxima: data.fechaMaximaAbastecimiento,
  };
};
