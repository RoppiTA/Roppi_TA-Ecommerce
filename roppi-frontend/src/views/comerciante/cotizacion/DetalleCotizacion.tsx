import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Edit3, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { StatusBadge } from "../../../components/StatusBadge";
import { MensajeModal } from "../../../components/MensajeModal";
import { Cotizacion } from "../../../types/cotizacion/cotizacion.types";

export function ComercianteCotizacionDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCotizacionDetalle, calcularSubtotal, resolverCotizacion } = useCotizaciones();

  const state = location.state as { id?: number; version?: number } | null;
  const cotizacion = getCotizacionDetalle(state?.id || 0, state?.version || 0);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [productosEditados, setProductosEditados] = useState<Cotizacion['productos']>(cotizacion?.productos || []);
  const [comentariosMerchant, setComentariosMerchant] = useState("");
  const [modalConfig, setModalConfig] = useState<{ tipo: 'exito' | 'error' | 'cargando' | 'confirmar', mensaje: string, onConfirm?: () => void } | null>(null);

  if (!cotizacion) {
    return <div className="p-10 text-center"><button onClick={() => navigate('/merchant/quotes')} className="bg-[#005f6a] text-white px-4 py-2 rounded-xl">Regresar</button></div>;
  }

  const subtotal = calcularSubtotal(modoEdicion ? productosEditados : cotizacion.productos);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

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

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-12" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="bg-[#005f6a] text-white sticky top-0 z-20 px-4 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/comerciante/quotes')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
          <div><h1 className="font-bold text-base">COT-N° {cotizacion.id} · Comerciante</h1><p className="text-[11px] text-white/70">Asignado a: {cotizacion.cliente}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge estado={cotizacion.estado} size="md" />
          {cotizacion.estado === "Solicitado" && !modoEdicion && (
            <button onClick={() => setModalConfig({
              tipo: 'confirmar',
              mensaje: '¿Estás seguro de resolver la cotización? Recuerda terminar todos los pasos dado que sino estos no se guardarán.',
              onConfirm: () => { setModalConfig(null); setModoEdicion(true); }
            })} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Resolver cotización</button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xs grid grid-cols-2 gap-4">
          <div><span className="text-[10px] font-bold text-[#8c6d53] block uppercase">Cliente Solicitante</span><span className="text-sm font-bold text-gray-900">{cotizacion.cliente}</span></div>
          <div><span className="text-[10px] font-bold text-[#8c6d53] block uppercase">Fecha de Ingreso</span><span className="text-sm font-bold text-gray-900">{cotizacion.fechaSolicitud}</span></div>
          <div><span className="text-[10px] font-bold text-[#8c6d53] block uppercase">Vencimiento Propuesto</span><span className="text-sm font-bold text-gray-900">{cotizacion.fechaVencimiento}</span></div>
          <div><span className="text-[10px] font-bold text-[#8c6d53] block uppercase">Instancia Actual</span><span className="text-sm font-bold text-gray-900">Versión v{cotizacion.version}</span></div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-gray-50/50 border-b"><h2 className="text-xs font-bold text-[#8c6d53] uppercase">Especificación de Ítems</h2></div>
          <div className="divide-y divide-gray-100">
            {(modoEdicion ? productosEditados : cotizacion.productos).map((p, idx) => (
              <div key={idx} className="p-5 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{p.nombre}</p>
                  <p className="text-xs text-gray-400 mt-1">Talla {p.atributos?.talla} · {p.atributos?.material}</p>
                  <p className="text-xs text-gray-500 font-medium">Cantidad: {p.cantidad} unidades</p>
                </div>
                <div className="text-right">
                  {modoEdicion ? (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-600 block">S/ Precio Unitario:</label>
                      <input type="number" step="0.01" value={p.precioUnitario} onChange={(e) => handlePrecioChange(idx, e.target.value)} className="w-24 text-right p-1.5 text-sm font-bold border border-amber-300 rounded-lg focus:outline-amber-500" />
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-gray-900 text-sm">S/ {(p.precioUnitario * p.cantidad).toFixed(2)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">c/u S/ {p.precioUnitario.toFixed(2)}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-gray-50/50 border-t space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-semibold">S/ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>IGV (18%)</span><span className="font-semibold">S/ {igv.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t font-bold text-gray-900"><span>Total General</span><span className="text-base text-[#005f6a]">S/ {total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Comentarios del Cliente (Siempre visible) */}
        {cotizacion.observacionesCliente && (
          <div className="bg-blue-50/40 rounded-[24px] border border-blue-100 p-5">
            <div className="flex items-center gap-1.5 text-blue-700 mb-1.5"><MessageSquare className="w-4 h-4" /><h3 className="text-xs font-bold uppercase">Requerimientos Especiales del Cliente</h3></div>
            <p className="text-xs text-gray-700 font-medium leading-relaxed">{cotizacion.observacionesCliente}</p>
          </div>
        )}

        {/* Comentarios del Comerciante */}
        {modoEdicion ? (
          <div className="bg-white rounded-[24px] border border-amber-200 p-5 space-y-2">
            <label className="text-xs font-bold text-amber-700 block uppercase">Comentarios y Observaciones del Comerciante (Obligatorio)</label>
            <textarea value={comentariosMerchant} onChange={(e) => setComentariosMerchant(e.target.value)} rows={3} placeholder="Detalla los cambios de costos, plazos de entrega o motivos del reajuste..." className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#005f6a] bg-gray-50" />
          </div>
        ) : (
          ["Aceptado", "Cancelado", "Observado"].includes(cotizacion.estado) && cotizacion.comentariosComerciante && (
            <div className="bg-[#fffbf7] rounded-[24px] border border-[#fbe9db] p-5">
              <div className="flex items-center gap-1.5 text-[#e77823] mb-1.5"><MessageSquare className="w-4 h-4" /><h3 className="text-xs font-bold uppercase">Respuesta del Comerciante (v{cotizacion.version})</h3></div>
              <p className="text-xs text-[#735338] font-medium leading-relaxed">{cotizacion.comentariosComerciante}</p>
            </div>
          )
        )}

        {/* Botonera de Acción en modo de resolución */}
        {modoEdicion && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => setModalConfig({
              tipo: 'confirmar',
              mensaje: '¿Estás seguro de cancelar la cotización? (Se guardará con estado definitivo "Cancelado")',
              onConfirm: () => ejecutarGuardado('Cancelado')
            })} className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Cancelar Cotización</button>

            <button onClick={() => setModalConfig({
              tipo: 'confirmar',
              mensaje: '¿Estás seguro de enviar esta propuesta? (Pasará a estado "Observado" a espera de aprobación del cliente)',
              onConfirm: () => ejecutarGuardado('Observado')
            })} className="flex-1 py-3 bg-[#005f6a] hover:bg-[#004d56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Enviar Cotización</button>
          </div>
        )}
      </div>

      {modalConfig && <MensajeModal tipo={modalConfig.tipo} mensaje={modalConfig.mensaje} onClose={() => setModalConfig(null)} onConfirm={modalConfig.onConfirm} />}
    </div>
  );
}