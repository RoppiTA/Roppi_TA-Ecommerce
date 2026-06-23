import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Hash, ChevronRight, FileText, ShoppingBag } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { StatusBadge } from "../../../components/StatusBadge";
import { EstadoCotizacion } from "../../../types/cotizacion/cotizacion.types";

export function CotizacionListScreen(userId: number, userType: "CLIENTE" | "COMERCIANTE") {
  const navigate = useNavigate();
  const { getCotizacionesResumen } = useCotizaciones(userId, userType); 
  const resumenes = getCotizacionesResumen();
  
  const [filtro, setFiltro] = useState<EstadoCotizacion | "Todos">("Todos");
  const tabs: Array<EstadoCotizacion | "Todos"> = ["Todos", "Solicitado", "Observado", "Aceptado", "Cancelado"];

  const filtradas = filtro === "Todos" ? resumenes : resumenes.filter((q) => q.estado === filtro);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${day} ${months[parseInt(month) - 1]}. ${year}`;
  };

  const handleViewCotizacion = (id: number, version: number) => {
    // Pasamos los datos mediante el estado interno del router de forma segura e invisible
    navigate('/quotes/view', { 
      state: { id, version } 
    });
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="bg-[#005f6a] text-white py-6 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><FileText /></div>
          <div>
            <h1 className="text-xl font-bold">Panel de Cotizaciones recibidas</h1>
            <p className="text-xs text-white/70">Gestiona las cotizaciones solicitadas y observadas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 items-center">
            {tabs.map((t) => {
              const isActive = filtro === t;
              return (
                <button
                  key={t}
                  onClick={() => setFiltro(t)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? "bg-[#005f6a] text-white shadow-sm" 
                      : "text-[#8c6d53] hover:bg-secondary/50 bg-transparent"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Listado */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-3">
        {filtradas.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Sin cotizaciones en este estado</p>
          </div>
        )}
        
        {filtradas.map((cotizacion) => (
          <button
            key={cotizacion.id}
            onClick={() => handleViewCotizacion(cotizacion.id, cotizacion.version)}
            className="w-full text-left bg-card rounded-2xl border border-border p-4 hover:border-accent hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-bold text-primary text-base">{cotizacion.id}</span>
                  <StatusBadge estado={cotizacion.estado} />
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cotizacion.comerciante}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Solicitado: {formatDate(cotizacion.fechaSolicitud)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-lg font-bold text-foreground">S/ {cotizacion.total.toFixed(2)}</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  <span>version {cotizacion.version}</span>
                  <span>·</span>
                  <span>{cotizacion.cantidadProductos} prod.</span>
                </div>
                <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}