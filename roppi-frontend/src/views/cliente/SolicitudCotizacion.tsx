import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, Send } from "lucide-react";
import { MensajeModal } from "../../components/MensajeModal";
import { StatusBadge } from "../../components/StatusBadge";

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

  const [modalConfig, setModalConfig] = useState<{
    tipo: 'exito' | 'error' | 'cargando' | 'confirmar';
    mensaje: string;
    onConfirmAction?: () => void;
  } | null>(null);

  const [productosSolicitados] = useState<CartItem[]>([
    {
      id: 101,
      nombre: "Polo Clásico Premium",
      precioUnitario: 45.00,
      cantidad: 3,
      atributos: { talla: "M", material: "Algodón 100%", personalizacion: "Estampado Pecho", color: "Negro" }
    },
    {
      id: 102,
      nombre: "Polera Heavyweight Hoodie",
      precioUnitario: 85.00,
      cantidad: 1,
      atributos: { talla: "L", material: "Franela Reactiva", personalizacion: "Bordado Manga", color: "Gris Grisáceo" }
    }
  ]);

  useEffect(() => {
    const hoy = new Date();
    const vence = new Date();
    vence.setDate(hoy.getDate() + 7);
    const fmt: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    setFechaHoy(hoy.toLocaleDateString('es-PE', fmt));
    setFechaVence(vence.toLocaleDateString('es-PE', fmt));
  }, []);

  const subtotal = productosSolicitados.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  const igv = subtotal * 0.18;
  const totalCompleto = subtotal + igv;

  const ejecutarEnvioSolicitud = () => {
    setModalConfig({ tipo: 'cargando', mensaje: 'Procesando y enviando tu solicitud de cotización...' });
    setTimeout(() => {
      setModalConfig({
        tipo: 'exito',
        mensaje: '¡Solicitud creada correctamente! El comerciante ha sido notificado y responderá pronto.',
        onConfirmAction: () => { setModalConfig(null); navigate('/quotes'); }
      });
    }, 2000);
  };

  const cardCls = "bg-white rounded-[20px] border border-gray-100 shadow-xs";
  const labelCls = "text-[10px] font-bold uppercase tracking-wide text-brand-muted block";
  const valueCls = "text-sm font-semibold text-brand-dark mt-0.5";

  return (
    <div className="min-h-screen lg:h-full bg-[#f4f7f8] flex flex-col overflow-x-hidden lg:overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

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
      </div>

      {/* Body — dos columnas */}
      <div className="px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-5 lg:gap-6 lg:flex-1 lg:overflow-hidden">

        {/* Columna izquierda */}
        <div className="flex-1 min-w-0 overflow-hidden space-y-5 pr-1">

          {/* Tabla de productos */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto overflow-y-auto max-h-[320px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 min-w-[180px]">Producto</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 min-w-[120px]">Personalización</th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3">Cantidad</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-3 py-3 whitespace-nowrap">Precio Unit.</th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-wide text-brand-muted px-5 py-3 whitespace-nowrap">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productosSolicitados.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">

                      {/* Producto + atributos */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-brand-dark">{p.nombre}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.atributos.talla && (
                            <span className="bg-brand-light/60 text-brand-dark text-[10px] font-medium rounded px-1.5 py-0.5">
                              T: {p.atributos.talla}
                            </span>
                          )}
                          {p.atributos.material && (
                            <span className="bg-brand-light/60 text-brand-dark text-[10px] font-medium rounded px-1.5 py-0.5">
                              {p.atributos.material}
                            </span>
                          )}
                          {p.atributos.color && (
                            <span className="bg-brand-light/60 text-brand-dark text-[10px] font-medium rounded px-1.5 py-0.5">
                              {p.atributos.color}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Personalización */}
                      <td className="px-3 py-4">
                        <span className="text-xs text-gray-500">{p.atributos.personalizacion || "—"}</span>
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-4 text-center">
                        <span className="font-bold text-brand-dark">{p.cantidad}</span>
                        <span className="block text-[10px] text-brand-muted">Und.</span>
                      </td>

                      {/* Precio unitario */}
                      <td className="px-3 py-4 text-right">
                        <span className="text-sm text-gray-500">S/ {p.precioUnitario.toFixed(2)}</span>
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
            <p className={`${labelCls} mb-3`}>Observaciones para el comerciante</p>
            <textarea
              rows={4}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escribe detalles sobre embalaje, variaciones especiales, horarios de entrega o cualquier condición requerida..."
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary2 focus:ring-1 focus:ring-primary2/30 bg-gray-50 resize-none transition-all placeholder-gray-400"
            />
          </div>

        </div>

        {/* Columna derecha */}
        <div className="w-full lg:w-[30%] lg:min-w-[260px] lg:max-w-[340px] lg:overflow-hidden space-y-4 pb-4">

          {/* Detalle de solicitud */}
          <div className={`${cardCls} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <p className={labelCls}>Detalle de solicitud</p>
              <StatusBadge estado="Solicitado" size="sm" />
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
              <div className="flex justify-between text-gray-500">
                <span>Subtotal aproximado</span>
                <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IGV estimado (18%)</span>
                <span className="font-semibold">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-brand-dark">
                <span>Total Proyectado</span>
                <span className="text-lg text-primary-hover">S/ {totalCompleto.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-brand-muted pt-1">Los precios son estimados. El comerciante confirmará el precio final.</p>
            </div>
          </div>

          {/* Acciones */}
          <div className={`${cardCls} p-4`}>
            <p className={`${labelCls} mb-3`}>Acciones</p>
            <div className="space-y-2">
              <button
                onClick={() => setModalConfig({
                  tipo: 'confirmar',
                  mensaje: '¿Estás seguro de que deseas enviar esta solicitud de cotización al comerciante asignado?',
                  onConfirmAction: ejecutarEnvioSolicitud
                })}
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
                className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-colors"
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
