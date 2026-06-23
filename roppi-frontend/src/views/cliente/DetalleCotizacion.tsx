import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Manejo de rutas nativo
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react";
import { useCotizaciones } from "../../hooks/useCotizaciones";
import { StatusBadge } from "../../components/StatusBadge";
import { MensajeModal } from "../../components/MensajeModal";

export function CotizacionDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCotizacionDetalle, calcularSubtotal,calcularDiasRestantes } = useCotizaciones();

  // Rescatamos las PKs compuestas guardadas en el estado interno del router
  const state = location.state as { id?: number; version?: number } | null;
  const cotizacionId = state?.id || 0;
  const version = state?.version || 0;

  const cotizacion = getCotizacionDetalle(cotizacionId, version);
  const [modalConfig, setModalConfig] = useState<{ tipo: 'exito' | 'error' | 'cargando' | 'confirmar', accion?: 'aceptar' | 'cancelar', mensaje: string } | null>(null);
  
  if (!cotizacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f8]">
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-sm mx-4">
          <p className="text-[#8c6d53] font-semibold mb-4">Acceso no válido al detalle de cotización.</p>
          <button 
            onClick={() => navigate('/quotes')} 
            className="px-5 py-2.5 bg-[#005f6a] text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
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

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-10" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header Corporativo (Figma: image_e8c3ff.png) */}
      <div className="bg-[#005f6a] text-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => navigate('/quotes')} 
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight leading-tight">
                Cotización · COT-N° {cotizacion.id}
              </h1>
              <p className="text-xs text-white/70 font-medium mt-0.5">Detalle del pedido</p>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white rounded-full px-1">
            <StatusBadge estado={cotizacion.estado} size="md" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Tarjeta de Información General */}
        <div className="bg-white rounded-[24px] border border-[#eef2f3] p-6 shadow-sm">
          <h2 className="text-xs font-bold text-[#8c6d53] uppercase tracking-wider mb-4">
            Información General
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#8c6d53] uppercase tracking-wide block"> Comerciante</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{cotizacion.comerciante}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#8c6d53] uppercase tracking-wide block"> Fecha de solicitud</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{cotizacion.fechaSolicitud}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#8c6d53] uppercase tracking-wide block"> Fecha de vencimiento</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{cotizacion.fechaVencimiento}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#8c6d53] uppercase tracking-wide block"># Versión</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">v{cotizacion.version}</span>
            </div>
          </div>
        </div>

        {/* Listado de Productos Solicitados */}
        <div className="bg-white rounded-[24px] border border-[#eef2f3] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-[#8c6d53] uppercase tracking-wider">
              Productos solicitados
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {cotizacion.productos.map((producto, index) => (
              <div key={producto.numeroLinea || index} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 items-start min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#e6f2f3] text-[#005f6a] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-base leading-tight">{producto.nombre}</p>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        Talla {producto.atributos?.talla || "M"} · {producto.atributos?.material || "Algodón"} · {producto.atributos?.personalizacion || "Estándar"} · {producto.atributos?.color || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-base">S/ {(producto.precioUnitario * producto.cantidad).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">{producto.cantidad} × S/ {producto.precioUnitario.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bloque de Totales */}
          <div className="px-6 py-5 bg-[#f8fafb] border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-800">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">IGV (18%)</span>
              <span className="font-semibold text-gray-800">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200/70 items-center">
              <span className="font-bold text-gray-900 text-base">Total</span>
              <span className="font-bold text-xl text-[#005f6a]">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Comentarios del Comerciante (Figma: image_e8c30e.png) */}
        {cotizacion.comentariosComerciante && (
          <div className="bg-[#fffbf7] rounded-[24px] border border-[#fbe9db] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-[#e77823] mb-2.5">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <h3 className="text-sm font-bold tracking-wide">Comentarios del comerciante</h3>
            </div>
            <p className="text-sm text-[#735338] leading-relaxed font-medium">
              {cotizacion.comentariosComerciante}
            </p>
          </div>
        )}

        {/* Sección de Acciones Dinámicas */}
        {cotizacion.estado === "Observado" && (
          <div className="bg-white rounded-[24px] border border-[#eef2f3] p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">¿Qué deseas hacer?</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                Revisa los comentarios del comerciante y decide si aceptas o cancelas esta cotización.
              </p>
            </div>
            <div className="flex items-center gap-2 mb-4 bg-red-50 text-red-700 p-3 rounded-xl border border-red-200">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="text-xs sm:text-sm font-medium">
                 {diasRestantes > 0 
                   ? `Atención: Quedan únicamente ${diasRestantes} día(s) para confirmar o rechazar esta propuesta.`
                   : "Urgente: El plazo límite de resolución expira en las próximas horas."}
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setModalConfig({ tipo: 'confirmar', accion: 'aceptar', mensaje: '¿Confirmas que deseas aceptar la cotización?' })}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#005f6a] text-white font-bold text-sm shadow-xs hover:bg-[#004d56] transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Aceptar cotización
              </button>
              <button
                onClick={() => setModalConfig({ tipo: 'confirmar', accion: 'cancelar', mensaje: '¿Confirmas que deseas rechazar y cancelar esta cotización?' })}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-red-500 text-red-600 font-bold text-sm hover:bg-red-50/50 transition-colors bg-white"
              >
                <XCircle className="w-4 h-4" /> Cancelar cotización
              </button>
            </div>
          </div>
        )}
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