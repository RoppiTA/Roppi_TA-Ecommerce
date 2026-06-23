import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, FileText, ClipboardList, Send } from "lucide-react";
import { MensajeModal } from "../../components/MensajeModal"; // Ajusta la ruta según tu estructura

// Interfaz para emular los productos que vienen del carrito de compras
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
  
  // Fechas automáticas (Hoy y Vencimiento en 7 días)
  const [fechaHoy, setFechaHoy] = useState("");
  const [fechaVence, setFechaVence] = useState("");

  // Estado para el manejo dinámico de las alertas y confirmaciones
  const [modalConfig, setModalConfig] = useState<{
    tipo: 'exito' | 'error' | 'cargando' | 'confirmar';
    mensaje: string;
    onConfirmAction?: () => void;
  } | null>(null);

  // Mock de productos provenientes del carrito (puedes reemplazarlo por tu hook useCart o location.state)
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

    const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    setFechaHoy(hoy.toLocaleDateString('es-PE', formatOptions));
    setFechaVence(vence.toLocaleDateString('es-PE', formatOptions));
  }, []);

  // Cálculos financieros
  const subtotal = productosSolicitados.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  const igv = subtotal * 0.18;
  const totalCompleto = subtotal + igv;

  // Manejador del flujo de envío
  const ejecutarEnvioSolicitud = () => {
    // 1. Cerrar modal de confirmación y pasar a cargando
    setModalConfig({
      tipo: 'cargando',
      mensaje: 'Procesando y enviando tu solicitud de cotización...'
    });

    // 2. Simular respuesta exitosa del servidor tras 2 segundos
    setTimeout(() => {
      setModalConfig({
        tipo: 'exito',
        mensaje: '¡Solicitud creada correctamente! El comerciante ha sido notificado y responderá pronto.',
        onConfirmAction: () => {
          setModalConfig(null);
          navigate('/quotes'); // Redirección final a la lista de cotizaciones
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] pb-12" style={{ fontFamily: "'Nunito', sans-serif" }}>
      
      {/* Header Superior Corporativo */}
      <div className="bg-[#005f6a] text-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate('/cart')} 
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-lg sm:text-xl tracking-tight leading-tight">
              Nueva Solicitud de Cotización
            </h1>
            <p className="text-xs text-white/70 font-medium mt-0.5">Confirma los detalles de tu orden personalizada</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Tarjeta de Tiempos y Fechas */}
        <div className="bg-white rounded-[24px] border border-[#eef2f3] p-6 shadow-sm">
          <h2 className="text-xs font-bold text-[#8c6d53] uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" /> Resumen de la Solicitud
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#8c6d53] uppercase tracking-wide block">Fecha de Registro</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{fechaHoy}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#8c6d53] uppercase tracking-wide block">Fecha Estimada de Vencimiento</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">{fechaVence} <span className="text-xs text-gray-400 font-normal">(7 días hábiles)</span></span>
            </div>
          </div>
        </div>

        {/* Listado de Productos Solicitados */}
        <div className="bg-white rounded-[24px] border border-[#eef2f3] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-[#8c6d53] uppercase tracking-wider">
              Productos seleccionados en el carrito
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {productosSolicitados.map((producto, index) => (
              <div key={producto.id} className="p-6 hover:bg-gray-50/30 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 items-start min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#e6f2f3] text-[#005f6a] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-base leading-tight">{producto.nombre}</p>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        Talla {producto.atributos.talla} · {producto.atributos.material} · {producto.atributos.personalizacion} · Color {producto.atributos.color}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-base">S/ {(producto.precioUnitario * producto.cantidad).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">{producto.cantidad} und × S/ {producto.precioUnitario.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bloque Financiero Estilo Figma */}
          <div className="px-6 py-5 bg-[#f8fafb] border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Subtotal aproximado</span>
              <span className="font-semibold text-gray-800">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">IGV estimado (18%)</span>
              <span className="font-semibold text-gray-800">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200/70 items-center">
              <span className="font-bold text-gray-900 text-base">Total Proyectado</span>
              <span className="font-bold text-xl text-[#005f6a]">S/ {totalCompleto.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cuadro de Observaciones del Cliente */}
        <div className="bg-white rounded-[24px] border border-[#eef2f3] p-6 shadow-sm space-y-3">
          <label htmlFor="observaciones" className="text-xs font-bold text-[#8c6d53] uppercase tracking-wider block">
            ✍️ Observaciones o especificaciones adicionales para el comerciante
          </label>
          <textarea
            id="observaciones"
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe aquí detalles sobre embalaje, variaciones especiales, horarios de entrega ideales o cualquier condición requerida..."
            className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 focus:outline-none focus:border-[#005f6a] focus:ring-1 focus:ring-[#005f6a] transition-all bg-[#fafbfc] placeholder-gray-400 resize-none"
          />
        </div>

        {/* Botonera Principal de Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setModalConfig({
              tipo: 'confirmar',
              mensaje: '¿Estás seguro de que deseas cancelar la solicitud? Se vaciarán los detalles ingresados y volverás al carrito.',
              onConfirmAction: () => { setModalConfig(null); navigate('/cart'); }
            })}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm bg-white hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            <XCircle className="w-4 h-4" /> Cancelar solicitud
          </button>
          
          <button
            onClick={() => setModalConfig({
              tipo: 'confirmar',
              mensaje: '¿Estás seguro de que deseas enviar esta solicitud de cotización al comerciante asignado?',
              onConfirmAction: ejecutarEnvioSolicitud
            })}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#005f6a] text-white font-bold text-sm shadow-sm hover:bg-[#004d56] transition-colors order-1 sm:order-2"
          >
            <Send className="w-4 h-4" /> Enviar solicitud
          </button>
        </div>

      </div>

      {/* Modal Reutilizable de Roppi */}
      {modalConfig && (
        <MensajeModal
          tipo={modalConfig.tipo}
          mensaje={modalConfig.mensaje}
          onClose={() => {
            // Si el modal es de éxito, al cerrar forzamos la redirección
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