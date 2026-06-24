import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, XCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../../components/StatusBadge";
import { MensajeModal } from "../../../components/MensajeModal";
import { Cotizacion } from "../../../types/cotizacion/cotizacion.types";

export function ComercianteCotizacionDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCotizacionDetalle, calcularSubtotal, resolverCotizacion } = useCotizaciones();

  const esComerciante = user?.role?.includes('COMERCIANTE') ?? true;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    if (!mq.matches) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const state = location.state as { id?: number; version?: number } | null;
  const cotizacion = getCotizacionDetalle(state?.id || 0, state?.version || 0);

  const modoEdicion = cotizacion?.estado === 'Solicitado' && esComerciante;
  const [productosEditados, setProductosEditados] = useState<Cotizacion['productos']>(
    () => (cotizacion?.productos ?? []).map(p => ({ ...p, precioUnitario: 0 }))
  );
  const [comentariosMerchant, setComentariosMerchant] = useState("");
  const [modalConfig, setModalConfig] = useState<{
    tipo: 'exito' | 'error' | 'cargando' | 'confirmar';
    mensaje: string;
    onConfirm?: () => void;
  } | null>(null);

  if (!cotizacion) {
    return (
      <div className="p-10 text-center">
        <button onClick={() => navigate('/comerciante/quotes')} className="bg-[#005f6a] text-white px-4 py-2 rounded-xl">
          Regresar
        </button>
      </div>
    );
  }

  const productos = modoEdicion ? productosEditados : cotizacion.productos;

  const subtotal = calcularSubtotal(productos)*0.92;
  const igv = subtotal * 0.18;
  const total = calcularSubtotal(productos);

  const subtotalInicial = calcularSubtotal(cotizacion.productos);
  const totalInicial = subtotalInicial;

  const handlePrecioChange = (index: number, valor: string) => {
    const copia = [...productosEditados];
    copia[index].precioUnitario = Math.max(0, parseFloat(valor) || 0);
    setProductosEditados(copia);
  };

  const ejecutarGuardado = (estadoFinal: 'Observado' | 'Cancelado') => {
    setModalConfig({ tipo: 'cargando', mensaje: 'Procesando cambios en el servidor...' });
    setTimeout(() => {
      const nuevaVersion = resolverCotizacion(cotizacion.id, cotizacion.version, estadoFinal, productosEditados, comentariosMerchant);
      setModalConfig({
        tipo: 'exito',
        mensaje: `La cotización ha sido actualizada a la versión v${nuevaVersion} en estado ${estadoFinal}.`,
        onConfirm: () => { setModalConfig(null); navigate('/comerciante/quotes'); }
      });
    }, 1500);
  };

  const labelCls = "text-[10px] font-bold uppercase tracking-wide text-brand-muted block";
  const valueCls = "text-sm font-semibold text-brand-dark mt-0.5";
  const cardCls = "bg-white rounded-[20px] border border-gray-100 shadow-xs";

  return (
    <div className="min-h-screen lg:h-full bg-[#f4f7f8] flex flex-col overflow-x-hidden lg:overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header */}
      <div className="px-4 lg:px-6 pt-6 pb-2 shrink-0 flex flex-col lg:flex-row items-start gap-3 lg:gap-6">
        {/* Left: navegación + título */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate('/comerciante/quotes')}
            className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover text-sm font-medium transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Volver a cotizaciones
          </button>
          <h1 className="text-xl font-semibold text-brand-dark">
            Cot-N° {cotizacion.id} - V{cotizacion.version}
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">Asignado a: {cotizacion.comerciante}</p>
        </div>

        {/* Right: banner modo edición */}
        {modoEdicion && (
          <div className="w-full lg:shrink-0 lg:self-stretch lg:w-[630px] rounded-xl border border-orange-100 border-l-4 border-l-orange-500 bg-[#FFF7ED] px-5 py-3 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={15} className="text-orange-500 shrink-0" />
              <span className="text-sm font-bold text-orange-800 whitespace-nowrap">Modo Edición Activado</span>
            </div>
            <p className="text-xs text-orange-700 leading-relaxed">
              Estás modificando precios y respuesta. Usa "Enviar cotización" para aplicar los cambios, regresa para descartarlos o presiona "Cancelar cotización" si deseas anular la venta.
            </p>
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-5 lg:gap-6 lg:flex-1 lg:overflow-hidden">

        {/* ── LEFT COLUMN (70%) ── */}
        <div className="flex-1 min-w-0 overflow-hidden space-y-5 pr-1">

          {/* Items table */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto overflow-y-auto max-h-[280px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 min-w-[180px]">Producto</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 min-w-[120px]">Personalización</th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3">Cantidad</th>
                    {esComerciante && (
                      <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 whitespace-nowrap">P.U. Cliente</th>
                    )}
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 whitespace-nowrap">
                      {esComerciante ? "P.U. Propuesto" : "Precio Final"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productos.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40 transition-colors">

                      {/* Producto + atributos */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-brand-dark">{p.nombre}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.atributos?.talla && (
                            <span className="bg-brand-light/60 text-brand-dark text-[10px] font-medium rounded px-1.5 py-0.5">
                              T: {p.atributos.talla}
                            </span>
                          )}
                          {p.atributos?.material && (
                            <span className="bg-brand-light/60 text-brand-dark text-[10px] font-medium rounded px-1.5 py-0.5">
                              {p.atributos.material}
                            </span>
                          )}
                          {p.atributos?.color && (
                            <span className="bg-brand-light/60 text-brand-dark text-[10px] font-medium rounded px-1.5 py-0.5">
                              {p.atributos.color}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Personalización */}
                      <td className="px-3 py-4">
                        <span className="text-xs text-gray-500">{p.atributos?.personalizacion || "—"}</span>
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-4 text-center">
                        <span className="font-bold text-brand-dark">{p.cantidad}</span>
                        <span className="block text-[10px] text-brand-muted">Und.</span>
                      </td>

                      {/* P.U. Cliente — solo visible para comerciante */}
                      {esComerciante && (
                        <td className="px-3 py-4 text-right">
                          <span className="text-sm text-gray-400">
                            S/ {cotizacion.productos[idx]?.precioUnitario.toFixed(2) ?? "—"}
                          </span>
                        </td>
                      )}

                      {/* P.U. Propuesto / Precio Final */}
                      <td className="px-5 py-4 text-right">
                        {modoEdicion ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={p.precioUnitario || ''}
                            placeholder="0.00"
                            onChange={(e) => handlePrecioChange(idx, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-24 text-right p-1.5 text-sm font-bold bg-amber-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                          />
                        ) : (
                          <>
                            <span className="font-bold text-brand-dark">S/ {p.precioUnitario.toFixed(2)}</span>
                            <span className="block text-[10px] text-brand-muted mt-0.5">
                              × {p.cantidad} = S/ {(p.precioUnitario * p.cantidad).toFixed(2)}
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Chat-style comments */}
          <div className={`${cardCls} p-5`}>
            <p className={`${labelCls} mb-4`}>Comentarios</p>

            {!cotizacion.observacionesCliente && !cotizacion.comentariosComerciante && !modoEdicion ? (
              <p className="text-xs text-brand-muted text-center py-4">Sin comentarios aún</p>
            ) : (
              <div className="space-y-3">
                {cotizacion.observacionesCliente && (
                  <div className="flex flex-col items-start max-w-[80%]">
                    <span className="text-[10px] font-bold text-brand-muted mb-1 ml-1">Cliente</span>
                    <div className="bg-blue-50 text-gray-700 text-xs rounded-2xl rounded-tl-sm px-4 py-3 leading-relaxed">
                      {cotizacion.observacionesCliente}
                    </div>
                  </div>
                )}
                {cotizacion.comentariosComerciante && !modoEdicion && (
                  <div className="flex flex-col items-end ml-auto max-w-[80%]">
                    <span className="text-[10px] font-bold text-brand-muted mb-1 mr-1">Comerciante</span>
                    <div className="bg-brand-light/50 text-brand-dark text-xs rounded-2xl rounded-tr-sm px-4 py-3 leading-relaxed">
                      {cotizacion.comentariosComerciante}
                    </div>
                  </div>
                )}
              </div>
            )}

            {modoEdicion && (
              <div className={cotizacion.observacionesCliente || cotizacion.comentariosComerciante ? "mt-4 pt-4 border-t border-gray-100" : ""}>
                <textarea
                  value={comentariosMerchant}
                  onChange={(e) => setComentariosMerchant(e.target.value)}
                  rows={3}
                  placeholder="Escribe tu respuesta para el cliente..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary2 bg-gray-50 resize-none"
                />
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN (30%) ── */}
        <div className="w-full lg:w-[30%] lg:min-w-[260px] lg:max-w-[340px] lg:overflow-hidden space-y-4 pb-4">

          {/* Detalle de cotización (estado + metadata unificados) */}
          <div className={`${cardCls} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <p className={labelCls}>Detalle de cotización</p>
              <StatusBadge estado={cotizacion.estado} size="sm" />
            </div>
            <div className="space-y-3">
              <div>
                <p className={labelCls}>Cliente</p>
                <p className={valueCls}>{cotizacion.cliente}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>Fecha de ingreso</p>
                  <p className={valueCls}>{cotizacion.fechaSolicitud}</p>
                </div>
                <div>
                  <p className={labelCls}>Vencimiento</p>
                  <p className={valueCls}>{cotizacion.fechaVencimiento}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de costos */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Resumen de Costos</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IGV (18%)</span>
                <span className="font-semibold">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-brand-dark">
                <span>Total Propuesto</span>
                <span className="text-lg text-primary-hover">S/ {total.toFixed(2)}</span>
              </div>
              {modoEdicion && (
                <div className="flex justify-between pt-1">
                  <span className="text-[11px] text-brand-muted">Total inicial del cliente</span>
                  <span className="text-[11px] text-brand-muted">S/ {totalInicial.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Acciones</p>

            {/* Solicitado — comerciante */}
            {cotizacion.estado === "Solicitado" && esComerciante && (
              <div className="space-y-2">
                <button
                  onClick={() => setModalConfig({
                    tipo: 'confirmar',
                    mensaje: 'Pasará a estado "Observado" a espera del cliente.',
                    onConfirm: () => ejecutarGuardado('Observado')
                  })}
                  className="w-full py-2.5 bg-primary2 hover:bg-primary-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Observación
                </button>
                <button
                  onClick={() => setModalConfig({
                    tipo: 'confirmar',
                    mensaje: '¿Estás seguro de cancelar la cotización? Se guardará con estado definitivo "Cancelado".',
                    onConfirm: () => ejecutarGuardado('Cancelado')
                  })}
                  className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancelar Cotización
                </button>
              </div>
            )}
            {cotizacion.estado === "Solicitado" && !esComerciante && (
              <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">En espera de observación del comerciante</p>
              </div>
            )}

            {/* Observado */}
            {cotizacion.estado === "Observado" && !esComerciante && (
              <div className="space-y-2">
                <button
                  onClick={() => setModalConfig({
                    tipo: 'confirmar',
                    mensaje: '¿Confirmas el pedido con los precios propuestos?',
                    onConfirm: () => {
                      setModalConfig({ tipo: 'cargando', mensaje: 'Procesando confirmación...' });
                      setTimeout(() => {
                        setModalConfig({
                          tipo: 'exito',
                          mensaje: 'Cotización aceptada exitosamente.',
                          onConfirm: () => { setModalConfig(null); navigate(-1); }
                        });
                      }, 1500);
                    }
                  })}
                  className="w-full py-2.5 bg-[#005f6a] hover:bg-[#004d56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Confirmar Pedido
                </button>
                <button
                  onClick={() => setModalConfig({
                    tipo: 'confirmar',
                    mensaje: '¿Estás seguro de cancelar esta cotización?',
                    onConfirm: () => {
                      setModalConfig({ tipo: 'cargando', mensaje: 'Cancelando cotización...' });
                      setTimeout(() => {
                        setModalConfig({
                          tipo: 'exito',
                          mensaje: 'Cotización cancelada.',
                          onConfirm: () => { setModalConfig(null); navigate(-1); }
                        });
                      }, 1500);
                    }
                  })}
                  className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancelar Cotización
                </button>
              </div>
            )}
            {cotizacion.estado === "Observado" && esComerciante && (
              <div className="flex items-start gap-2 bg-orange-50 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700">En espera de confirmación del cliente</p>
              </div>
            )}

            {/* Aceptado */}
            {cotizacion.estado === "Aceptado" && (
              <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700">Cotización aceptada</p>
              </div>
            )}

            {/* Cancelado */}
            {cotizacion.estado === "Cancelado" && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl px-4 py-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-600">Cotización cancelada</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {modalConfig && (
        <MensajeModal
          tipo={modalConfig.tipo}
          mensaje={modalConfig.mensaje}
          onClose={() => setModalConfig(null)}
          onConfirm={modalConfig.onConfirm}
        />
      )}
    </div>
  );
}
