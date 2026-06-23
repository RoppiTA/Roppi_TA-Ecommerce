import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Hash, ChevronRight, FileText, ShoppingBag, UserCheck } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { StatusBadge } from "../../../components/StatusBadge";
import { EstadoCotizacion } from "../../../types/cotizacion/cotizacion.types";

export function ComercianteCotizacionListScreen() {
  const navigate = useNavigate();
  const { getCotizacionesResumen } = useCotizaciones();
  const [filtro, setFiltro] = useState<EstadoCotizacion | "Todos">("Todos");
  
  const resumenes = getCotizacionesResumen();
  const tabs: Array<EstadoCotizacion | "Todos"> = ["Todos", "Solicitado", "Observado", "Aceptado", "Cancelado"];
  const filtradas = filtro === "Todos" ? resumenes : resumenes.filter((q) => q.estado === filtro);

  return (
    <div className="min-h-screen bg-[#f4f7f8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="bg-[#005f6a] text-white py-6 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><FileText /></div>
          <div>
            <h1 className="text-xl font-bold">Panel de Cotizaciones recibidas</h1>
            <p className="text-xs text-white/70">Gestiona las solicitudes de tus clientes</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 flex gap-2 overflow-x-auto py-3">
          {tabs.map((t) => (
            <button key={t} onClick={() => setFiltro(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtro === t ? "bg-[#005f6a] text-white" : "text-[#8c6d53] hover:bg-gray-100"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-gray-400"><ShoppingBag className="mx-auto mb-2 opacity-25" /><p className="text-sm">No hay registros en esta sección</p></div>
        )}
        {filtradas.map((c) => (
          <button key={`${c.id}-${c.version}`} onClick={() => navigate('/comerciante/quotes/view', { state: { id: c.id, version: c.version } })} className="w-full text-left bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-xs transition-all flex justify-between items-start gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2"><span className="font-bold text-gray-900">COT-N° {c.id}</span><StatusBadge estado={c.estado} /></div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-600"><UserCheck className="w-3.5 h-3.5 text-[#8c6d53]" /> <span>Cliente: {c.cliente}</span></div>
              <div className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Solicitado el {c.fechaSolicitud}</div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-base font-bold text-[#005f6a]">S/ {c.total.toFixed(2)}</span>
              <div className="text-[10px] text-gray-400 font-bold flex items-center justify-end gap-1"><Hash className="w-2.5 h-2.5" /> v{c.version} · {c.cantidadProductos} unds.</div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}