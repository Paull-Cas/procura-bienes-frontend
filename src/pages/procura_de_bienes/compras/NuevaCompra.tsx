import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Package, DollarSign, Send, Search, Calendar, Clock, Building2, Wrench, ChevronRight, Paperclip, FileText, X } from "lucide-react";
import Toast from "../../components/Toast";
import { UsuarioProfile } from "../../data/models";
import { Procura } from "../data/models";
import { fetchProcuras } from "../data/api";
import { OfertaCotizada } from "./data/models";
import { fetchComparativo, createCompra } from "./data/api";

interface NuevaCompraProps {
  user: UsuarioProfile;
}

export default function NuevaCompra({ user }: NuevaCompraProps) {
  const [procuras, setProcuras] = useState<Procura[]>([]);
  const [procuraSel, setProcuraSel] = useState<Procura | null>(null);
  const [ofertas, setOfertas] = useState<OfertaCotizada[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({}); // idDetalleRequerimiento -> idDetalleCotizacion
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [contratoBase64, setContratoBase64] = useState<string>("");
  const [contratoNombre, setContratoNombre] = useState<string>("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const notificar = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Lee el contrato (PDF) y lo guarda como base64 puro (sin el prefijo data:)
  const onSeleccionarContrato = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setContratoBase64(result.split(",")[1] || "");
      setContratoNombre(file.name);
    };
    reader.readAsDataURL(file);
  };

  const cargarProcuras = async () => {
    try {
      setProcuras(await fetchProcuras(user.id));
    } catch {
      setProcuras([]);
    }
  };

  useEffect(() => {
    cargarProcuras();
  }, []);

  const seleccionarProcura = async (procura: Procura) => {
    setProcuraSel(procura);
    setSeleccion({});
    setLoading(true);
    try {
      setOfertas(await fetchComparativo(procura.id_procura!));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      notificar(`Error al cargar el comparativo: ${message}`, "error");
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar ofertas por ítem del requerimiento para comparar precios entre proveedores
  const ofertasPorItem = useMemo(() => {
    const mapa = new Map<number, OfertaCotizada[]>();
    ofertas.forEach((oferta) => {
      const lista = mapa.get(oferta.idDetalleRequerimiento) || [];
      lista.push(oferta);
      mapa.set(oferta.idDetalleRequerimiento, lista);
    });
    return Array.from(mapa.entries());
  }, [ofertas]);

  const ofertasSeleccionadas = useMemo(
    () =>
      ofertas.filter(
        (o) => seleccion[o.idDetalleRequerimiento] === o.idDetalleCotizacion
      ),
    [ofertas, seleccion]
  );

  // Cada proveedor (cotización) genera una orden de compra independiente
  const ordenesPorProveedor = useMemo(() => {
    const mapa = new Map<number, OfertaCotizada[]>();
    ofertasSeleccionadas.forEach((oferta) => {
      const lista = mapa.get(oferta.idCotizacion) || [];
      lista.push(oferta);
      mapa.set(oferta.idCotizacion, lista);
    });
    return Array.from(mapa.values());
  }, [ofertasSeleccionadas]);

  const elegirOferta = (idDetalleReq: number, idDetalleCot: number) => {
    setSeleccion((prev) => {
      if (prev[idDetalleReq] === idDetalleCot) {
        const copia = { ...prev };
        delete copia[idDetalleReq];
        return copia;
      }
      return { ...prev, [idDetalleReq]: idDetalleCot };
    });
  };

  const emitirOrdenes = async () => {
    if (ordenesPorProveedor.length === 0) {
      notificar("Selecciona al menos un ítem para emitir una orden", "error");
      return;
    }
    setEnviando(true);
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const codigos: string[] = [];
      for (const grupo of ordenesPorProveedor) {
        const subtotal = grupo.reduce(
          (acc, o) => acc + o.precioUnitario * o.cantidad,
          0
        );
        const codigo = await createCompra(
          {
            idCotizacion: grupo[0].idCotizacion,
            gestorCompra: user.nombre,
            fechaCompra: hoy,
            precioSubtotal: subtotal,
            documentoCompra: contratoBase64 || undefined,
          },
          grupo.map((o) => ({
            idDetalleCotizacion: o.idDetalleCotizacion,
            cantidadComprada: o.cantidad,
            precioCompra: o.precioUnitario,
          }))
        );
        codigos.push(codigo);
      }
      notificar(
        `Órdenes de compra emitidas: ${codigos.join(", ")}`,
        "success"
      );
      setProcuraSel(null);
      setOfertas([]);
      setSeleccion({});
      setContratoBase64("");
      setContratoNombre("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      notificar(`Error al emitir órdenes: ${message}`, "error");
    } finally {
      setEnviando(false);
    }
  };

  const procurasFiltradas = procuras.filter((p) =>
    p.codigo_procura?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="rounded-lg pb-2">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl flex items-center justify-between mb-6 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="text-orange-600" size={28} />
          Nueva Orden de Compra
        </h2>
        {procuraSel && (
          <button
            onClick={() => {
              setProcuraSel(null);
              setOfertas([]);
              setSeleccion({});
            }}
            className="text-sm text-orange-700 underline cursor-pointer"
          >
            ← Elegir otra procura
          </button>
        )}
      </div>

      {!procuraSel && (
        <div className="px-4">
          <div className="flex items-center border-2 border-orange-200 rounded-lg bg-white shadow-sm mb-4">
            <Search className="text-orange-500 ml-3" size={20} />
            <input
              type="text"
              placeholder="Buscar procura por código..."
              className="w-full p-2.5 outline-none rounded-lg"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {procurasFiltradas.map((procura) => {
              const esObra = procura.tipo_requerimiento === "Obra";
              const vencido = (procura.estado || "").toLowerCase() === "vencido";
              return (
                <button
                  key={procura.id_procura}
                  onClick={() => seleccionarProcura(procura)}
                  className="group relative text-left bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Barra de acento lateral */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600" />

                  <div className="p-4 pl-5">
                    {/* Encabezado: icono + código */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <ShoppingCart size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {procura.codigo_procura}
                        </h3>
                        <p className="text-xs text-gray-400">Procura para cotizar</p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 ml-auto flex-shrink-0 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                      />
                    </div>

                    {/* Fechas clave */}
                    <div className="space-y-1.5 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                        <span className="font-medium">Máx. cotización:</span>
                        <span>{procura.fecha_maxima_cotizacion || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-red-500 flex-shrink-0" />
                        <span className="font-medium">Máx. abastecimiento:</span>
                        <span>{procura.fecha_maxima_abastecimiento || "—"}</span>
                      </div>
                    </div>

                    {/* Píldoras: tipo + estado */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          esObra
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {esObra ? <Building2 size={12} /> : <Wrench size={12} />}
                        {procura.tipo_requerimiento}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          vencido
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            vencido ? "bg-red-500" : "bg-green-500"
                          }`}
                        />
                        {procura.estado}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {procurasFiltradas.length === 0 && (
              <div className="col-span-full text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <ShoppingCart className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No hay procuras disponibles
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Ajusta la búsqueda o espera a que se publiquen nuevas procuras
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {procuraSel && (
        <div className="px-4">
          <p className="text-gray-700 mb-4">
            Procura <span className="font-semibold">{procuraSel.codigo_procura}</span> — selecciona
            una oferta por cada ítem para armar las órdenes de compra.
          </p>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando comparativo...</p>
          ) : ofertasPorItem.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Esta procura no tiene ofertas aceptadas técnicamente para comprar.
            </p>
          ) : (
            <div className="space-y-6">
              {ofertasPorItem.map(([idDetalleReq, lista]) => (
                <div
                  key={idDetalleReq}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <p className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <Package className="text-orange-500" size={18} />
                    Ítem #{idDetalleReq}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lista.map((oferta) => {
                      const elegida =
                        seleccion[idDetalleReq] === oferta.idDetalleCotizacion;
                      return (
                        <button
                          key={oferta.idDetalleCotizacion}
                          onClick={() =>
                            elegirOferta(idDetalleReq, oferta.idDetalleCotizacion)
                          }
                          className={`text-left rounded-lg border-2 p-3 transition cursor-pointer ${
                            elegida
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <p className="font-medium text-gray-800">
                            {oferta.proveedor}
                          </p>
                          <p className="text-sm text-gray-500">
                            {oferta.codigoCotizacion}
                          </p>
                          <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                            <DollarSign size={14} className="text-green-600" />
                            {oferta.moneda} {oferta.precioUnitario} × {oferta.cantidad}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 space-y-3">
                {/* Adjuntar contrato (documento de la orden) */}
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 bg-orange-50 border-2 border-dashed border-orange-300 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-orange-100 transition">
                    <Paperclip size={16} />
                    {contratoNombre ? "Cambiar contrato" : "Adjuntar contrato (PDF)"}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={onSeleccionarContrato}
                    />
                  </label>
                  {contratoNombre && (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                      <FileText size={14} className="text-red-500" />
                      {contratoNombre}
                      <button
                        type="button"
                        onClick={() => {
                          setContratoBase64("");
                          setContratoNombre("");
                        }}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Quitar"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    El mismo contrato se adjunta a cada orden emitida.
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    {ofertasSeleccionadas.length} ítems seleccionados ·{" "}
                    {ordenesPorProveedor.length} orden(es) a emitir
                  </p>
                  <button
                    onClick={emitirOrdenes}
                    disabled={enviando || ordenesPorProveedor.length === 0}
                    className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={18} />
                    {enviando ? "Emitiendo..." : "Emitir órdenes de compra"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
