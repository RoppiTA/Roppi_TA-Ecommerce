import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { StatusBadge } from "../../../components/StatusBadge";
import { MensajeModal } from "../../../components/MensajeModal";
import { Cotizacion } from "../../../types/cotizacion/cotizacion.types";

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '–';
  const [year, month, day] = dateStr.split("T")[0].split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${day} ${months[parseInt(month) - 1]}. ${year}`;
};

export function CotizacionDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCotizacionDetalle, calcularSubtotal, calcularDiasRestantes } = useCotizaciones();

  const state = location.state as { id?: number; version?: number } | null;
  const cotizacionId = state?.id || 0;
  const version = state?.version || 0;

  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [modalConfig, setModalConfig] = useState<{ tipo: 'exito' | 'error' | 'cargando' | 'confirmar', accion?: 'aceptar' | 'cancelar', mensaje: string } | null>(null);

  useEffect(() => {
    if (!cotizacionId || !version) { setLoadingDetail(false); return; }
    fetchCotizacionDetalle(cotizacionId, version).then(cot => {
      setCotizacion(cot);
      setLoadingDetail(false);
    });
  // fetchCotizacionDetalle cambia al actualizar cotizaciones; solo ejecutar al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotizacionId, version]);

  const procesarAccion = () => {
    const accionRealizada = modalConfig?.accion;
    setModalConfig(null);
    setTimeout(() => {
      setModalConfig({
        tipo: 'exito',
        mensaje: accionRealizada === 'aceptar'
          ? '¡Éxito! La cotización ha sido aprobada correctamente.'
          : 'La cotización ha sido cancelada y archivada.'
      });
    }, 200);
  };

  const cardCls = "bg-white rounded-[20px] border border-[#C8E6E8] shadow-[0_2px_16px_rgba(61,30,8,0.06)]";
  const labelCls = "text-[10px] font-bold uppercase tracking-wide text-brand-muted block";
  const valueCls = "text-sm font-semibold text-brand-dark mt-0.5";

  if (loadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-brand-muted text-sm font-semibold">Cargando cotización...</p>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="text-center bg-white p-8 rounded-[20px] border border-[#C8E6E8] shadow-[0_2px_16px_rgba(61,30,8,0.06)] max-w-sm mx-4">
          <p className="text-brand-muted font-semibold mb-4">Acceso no válido al detalle de cotización.</p>
          <button
            onClick={() => navigate('/quotes')}
            className="px-5 py-2.5 bg-primary2 text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const subtotal = calcularSubtotal(cotizacion.productos);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  const diasRestantes = calcularDiasRestantes(cotizacion.fechaVencimiento);

  return (
    <div className="min-h-screen lg:h-full bg-white flex flex-col overflow-x-hidden lg:overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header inline */}
      <div className="px-4 lg:px-6 pt-6 pb-2 shrink-0">
        <button
          onClick={() => navigate('/quotes')}
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

      {/* Body — dos columnas */}
      <div className="px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-5 lg:gap-6 lg:flex-1 lg:overflow-hidden">

        {/* Columna izquierda */}
        <div className="flex-1 min-w-0 overflow-hidden space-y-5 pr-1">

          {/* Tabla de productos */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-brand-light border-b border-[#C8E6E8]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 min-w-[180px]">Producto</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 min-w-[120px]">Personalización</th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3">Cantidad</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 whitespace-nowrap">Precio Unit.</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 whitespace-nowrap">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8E6E8]">
                  {cotizacion.productos.map((producto, index) => (
                    <tr key={producto.numeroLinea || index} className="hover:bg-[#E2F4F5] transition-colors">

                      {/* Producto + atributos */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-brand-dark">{producto.nombre}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {producto.atributos?.talla && (
                            <span className="bg-brand-light/40 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                              T: {producto.atributos.talla}
                            </span>
                          )}
                          {producto.atributos?.material && (
                            <span className="bg-brand-light/40 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                              {producto.atributos.material}
                            </span>
                          )}
                          {producto.atributos?.color && (
                            <span className="bg-brand-light/40 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                              {producto.atributos.color}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Personalización */}
                      <td className="px-3 py-4">
                        <span className="text-xs text-brand-muted">{producto.atributos?.personalizacion || "—"}</span>
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-4 text-center">
                        <span className="font-bold text-brand-dark">{producto.cantidad}</span>
                        <span className="block text-[10px] text-brand-muted/70">Und.</span>
                      </td>

                      {/* Precio unitario */}
                      <td className="px-3 py-4 text-right">
                        <span className="text-sm text-brand-muted">S/ {producto.precioUnitario.toFixed(2)}</span>
                      </td>

                      {/* Subtotal línea */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-brand-dark">S/ {(producto.precioUnitario * producto.cantidad).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comentarios del comerciante */}
          {cotizacion.comentariosComerciante && (
            <div className={`${cardCls} p-5`}>
              <p className={`${labelCls} mb-4`}>Comentarios del comerciante</p>
              <div className="flex flex-col items-end ml-auto max-w-[80%]">
                <div className="bg-brand-light/50 text-brand-dark text-xs rounded-2xl rounded-tr-sm px-4 py-3 leading-relaxed">
                  {cotizacion.comentariosComerciante}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Columna derecha */}
        <div className="w-full lg:w-[30%] lg:min-w-[260px] lg:max-w-[340px] lg:overflow-hidden space-y-4 pb-4">

          {/* Detalle de cotización */}
          <div className={`${cardCls} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <p className={labelCls}>Detalle de cotización</p>
              <StatusBadge estado={cotizacion.estado} size="sm" />
            </div>
            <div className="space-y-3">
              <div>
                <p className={labelCls}>Comerciante</p>
                <p className={valueCls}>{cotizacion.comerciante}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>Fecha de solicitud</p>
                  <p className={valueCls}>{formatDate(cotizacion.fechaSolicitud)}</p>
                </div>
                <div>
                  <p className={labelCls}>Vencimiento</p>
                  <p className={valueCls}>{formatDate(cotizacion.fechaVencimiento)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de costos */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Resumen de Costos</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>IGV (18%)</span>
                <span className="font-semibold">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#C8E6E8] font-bold text-brand-dark">
                <span>Total</span>
                <span className="text-lg text-brand-dark">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Acciones</p>

            {cotizacion.estado === "OBSERVADA" && (
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    {diasRestantes > 0
                      ? `Quedan ${diasRestantes} día(s) para confirmar o rechazar esta propuesta.`
                      : "Urgente: El plazo límite de resolución expira en las próximas horas."}
                  </p>
                </div>
                <button
                  onClick={() => setModalConfig({ tipo: 'confirmar', accion: 'aceptar', mensaje: '¿Confirmas que deseas aceptar la cotización?' })}
                  className="w-full py-2.5 bg-primary2 hover:bg-primary-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Aceptar cotización
                </button>
                <button
                  onClick={() => setModalConfig({ tipo: 'confirmar', accion: 'cancelar', mensaje: '¿Confirmas que deseas rechazar y cancelar esta cotización?' })}
                  className="w-full py-2.5 bg-transparent hover:bg-[#FFF5EE] text-brand-error font-bold text-xs rounded-xl border border-brand-error/40 hover:border-brand-error/70 flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancelar cotización
                </button>
              </div>
            )}

            {cotizacion.estado === "SOLICITADA" && (
              <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">En espera de observación del comerciante</p>
              </div>
            )}

            {cotizacion.estado === "ACEPTADA" && (
              <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700">Cotización aceptada</p>
              </div>
            )}

            {cotizacion.estado === "CANCELADA" && (
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
          onConfirm={procesarAccion}
        />
      )}
    </div>
  );
}
