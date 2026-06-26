import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, Send } from "lucide-react";
import { MensajeModal } from "../../components/MensajeModal";
import { StatusBadge } from "../../components/StatusBadge";
import { useCarrito } from "../../context/CarritoContext";
import { CotizacionesAPIService } from "../../api/cotizaciones.api";

// CartItem: forma local usada en la tabla de esta vista
interface CartItem {
  id: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  atributos: {
    talla: string;
    material: string;
    personalizacion: string;
    color: string;
  };
}

export function SolicitudCotizacionScreen() {
  const navigate = useNavigate();
  const [observaciones, setObservaciones] = useState("");
  const [fechaHoy, setFechaHoy] = useState("");
  const [fechaVence, setFechaVence] = useState("");
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    tipo: 'exito' | 'error' | 'cargando' | 'confirmar';
    mensaje: string;
    onConfirmAction?: () => void;
  } | null>(null);

  // Entidad: LineaCarrito[] — ítems reales del carrito del cliente
  const { items: carritoItems, clearCart, carritoId } = useCarrito();

  // Mapea LineaCarrito al formato CartItem que usa la tabla de esta vista
  const productosSolicitados: CartItem[] = carritoItems.map((linea) => ({
    id: linea.productoId,
    nombre: linea.nombre,
    precioUnitario: linea.precioUnitario,
    cantidad: linea.cantidad,
    atributos: {
      talla: linea.atributos.talla,
      material: linea.atributos.material,
      personalizacion: linea.atributos.personalizacion,
      color: linea.atributos.color,
    },
  }));

  useEffect(() => {
    const hoy = new Date();
    const vence = new Date();
    vence.setDate(hoy.getDate() + 7);
    const fmt: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    setFechaHoy(hoy.toLocaleDateString('es-PE', fmt));
    setFechaVence(vence.toLocaleDateString('es-PE', fmt));
  }, []);

  const a = productosSolicitados.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  const subtotal = a * 0.82;
  const igv = a * 0.18;
  const totalCompleto = subtotal + igv;

  const ejecutarEnvioSolicitud = () => {
    setIntentoEnvio(true);

    //Verificación de seguridad: si está vacío o solo tiene espacios, bloqueamos el proceso
    if (observaciones.trim().length === 0) {
      return; 
    }

    setModalConfig({
      tipo: 'confirmar',
      mensaje: '¿Estás seguro de que deseas enviar esta solicitud de cotización con los detalles ingresados?',
      onConfirmAction: () => {
        // Al confirmar dentro del modal, pasamos al estado de carga y envío real
        procesarEnvioFinal();
      }
    });
  };
  const procesarEnvioFinal = async () => {
    setModalConfig({ tipo: 'cargando', mensaje: 'Procesando tu solicitud de cotización...' });

    if (!carritoId) {
      setModalConfig({ tipo: 'error', mensaje: 'No se encontró el carrito activo. Recarga la página e intenta de nuevo.' });
      return;
    }

    try {
      await CotizacionesAPIService.solicitarCotizacion(carritoId, observaciones);
      setModalConfig({
        tipo: 'exito',
        mensaje: 'Tu solicitud de cotización ha sido enviada con éxito al comerciante. Recibirás una respuesta pronto.',
        onConfirmAction: () => {
          clearCart();
          navigate('/quotes');
        }
      });
    } catch {
      setModalConfig({ tipo: 'error', mensaje: 'Ocurrió un error al enviar la solicitud. Intenta de nuevo.' });
    }
  };
  const cardCls = "bg-white rounded-[20px] border border-[#C8E6E8] shadow-[0_2px_16px_rgba(61,30,8,0.06)]";
  const labelCls = "text-[10px] font-bold uppercase tracking-wide text-brand-muted block";
  const valueCls = "text-sm font-semibold text-brand-dark mt-0.5";

  return (
    <div className="min-h-screen lg:h-full bg-white flex flex-col overflow-x-hidden lg:overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header inline — navegación sin fondo oscuro */}
      <div className="px-4 lg:px-6 pt-6 pb-2 shrink-0">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover text-sm font-medium transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Volver al carrito
        </button>
        <h1 className="text-xl font-semibold text-brand-dark">Nueva Solicitud de Cotización</h1>
        <p className="text-sm text-brand-muted mt-0.5">Confirma los detalles antes de enviar</p>
        {/* DEBUG — comentar antes de producción */}
        <p className="text-xs text-brand-muted/60 mt-1 font-mono">
          carritoId: <span className="font-bold text-primary2">{carritoId ?? 'null'}</span>
        </p>
        {/* FIN DEBUG */}
      </div>

      {/* Body — dos columnas */}
      <div className="px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-5 lg:gap-6 lg:flex-1 lg:overflow-hidden">

        {/* Columna izquierda */}
        <div className="flex-1 min-w-0 overflow-hidden space-y-5 pr-1">

          {/* Tabla de productos */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-primary-hover/15">
                  <tr className="bg-brand-light border-b border-[#C8E6E8]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 min-w-[180px]">Producto</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 min-w-[120px]">Personalización</th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3">Cantidad</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 whitespace-nowrap">Precio Unit.</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 whitespace-nowrap">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8E6E8]">
                  {productosSolicitados.map((p) => (
                    <tr key={p.id} className="hover:bg-[#E2F4F5] transition-colors">

                      {/* Producto + atributos */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-brand-dark">{p.nombre}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.atributos.talla && (
                            <span className="bg-brand-light/40 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                              T: {p.atributos.talla}
                            </span>
                          )}
                          {p.atributos.material && (
                            <span className="bg-brand-light/40 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                              {p.atributos.material}
                            </span>
                          )}
                          {p.atributos.color && (
                            <span className="bg-brand-light/40 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                              {p.atributos.color}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Personalización */}
                      <td className="px-3 py-4">
                        <span className="text-xs text-brand-muted">{p.atributos.personalizacion || "—"}</span>
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-4 text-center">
                        <span className="font-bold text-brand-dark">{p.cantidad}</span>
                        <span className="block text-[10px] text-brand-muted/70">Und.</span>
                      </td>

                      {/* Precio unitario */}
                      <td className="px-3 py-4 text-right">
                        <span className="text-sm text-brand-muted">S/ {p.precioUnitario.toFixed(2)}</span>
                      </td>

                      {/* Subtotal línea */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-brand-dark">S/ {(p.precioUnitario * p.cantidad).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observaciones */}
          <div className={`${cardCls} p-5`}>
            <div className="flex justify-between items-end mb-3">
              <p className={`${labelCls}`}>
                Observaciones para el comerciante <span className="text-red-500">*</span>
              </p>
              {/* Contador de caracteres */}
              <span className={`text-[11px] font-medium ${observaciones.length >= 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                {observaciones.length}/1000
              </span>
            </div>
            
            <textarea
              rows={4}
              maxLength={1000} // Limita exactamente a 1000 caracteres
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escribe detalles sobre embalaje, variaciones especiales, horarios de entrega o cualquier condición requerida..."
              className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-1 bg-[#FDFAF7] resize-none transition-all placeholder-brand-muted/40 ${
                intentoEnvio && observaciones.trim().length === 0 
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                  : 'border-[#EDE8E3] focus:border-brand-muted/50 focus:ring-brand-muted/20'
              }`}
            />
            
            {/* Mensaje de error (se muestra si no hay texto válido) */}
            {intentoEnvio && observaciones.trim().length === 0 && (
              <p className="text-[11px] text-red-500 font-medium mt-1.5">
                Este campo no puede estar vacío ni contener únicamente espacios.
              </p>
            )}
          </div>

        </div>

        {/* Columna derecha */}
        <div className="w-full lg:w-[30%] lg:min-w-[260px] lg:max-w-[340px] lg:overflow-hidden space-y-4 pb-4">

          {/* Detalle de solicitud */}
          <div className={`${cardCls} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <p className={labelCls}>Detalle de solicitud</p>
              <StatusBadge estado="Carrito" size="sm" />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>Fecha de registro</p>
                  <p className={valueCls}>{fechaHoy}</p>
                </div>
                <div>
                  <p className={labelCls}>Vencimiento estimado</p>
                  <p className={valueCls}>{fechaVence}</p>
                </div>
              </div>
              <div>
                <p className={labelCls}>Productos en la solicitud</p>
                <p className={valueCls}>{productosSolicitados.length} ítem(s)</p>
              </div>
            </div>
          </div>

          {/* Resumen de costos */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Resumen de Costos</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal aproximado</span>
                <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>IGV estimado (18%)</span>
                <span className="font-semibold">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#C8E6E8] font-bold text-brand-dark">
                <span>Total Proyectado</span>
                <span className="text-lg text-brand-dark">S/ {totalCompleto.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-brand-muted pt-1">Los precios son estimados. El comerciante confirmará el precio final.</p>
            </div>
          </div>

          {/* Acciones */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Acciones</p>
            <div className="space-y-2">
              <button
                onClick={ejecutarEnvioSolicitud}
                className="w-full py-2.5 bg-primary2 hover:bg-primary-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Enviar solicitud
              </button>
              <button
                onClick={() => setModalConfig({
                  tipo: 'confirmar',
                  mensaje: '¿Estás seguro de que deseas cancelar la solicitud? Se vaciarán los detalles ingresados y volverás al carrito.',
                  onConfirmAction: () => { setModalConfig(null); navigate('/cart'); }
                })}
                className="w-full py-2.5 bg-transparent hover:bg-[#FFF5EE] text-brand-error font-bold text-xs rounded-xl border border-brand-error/40 hover:border-brand-error/70 flex items-center justify-center gap-2 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancelar solicitud
              </button>
            </div>
          </div>

        </div>
      </div>

      {modalConfig && (
        <MensajeModal
          tipo={modalConfig.tipo}
          mensaje={modalConfig.mensaje}
          onClose={() => {
            if (modalConfig.tipo === 'exito' && modalConfig.onConfirmAction) {
              modalConfig.onConfirmAction();
            } else {
              setModalConfig(null);
            }
          }}
          onConfirm={modalConfig.onConfirmAction}
        />
      )}

    </div>
  );
}
