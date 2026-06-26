import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Hash, ChevronRight, ShoppingBag, Store } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { StatusBadge } from "../../../components/StatusBadge";
import { EstadoCotizacion } from "../../../types/cotizacion/cotizacion.types";

export function CotizacionListScreen() {
  const navigate = useNavigate();
  const { getCotizacionesResumen } = useCotizaciones();
  const resumenes = getCotizacionesResumen();

  const [filtro, setFiltro] = useState<EstadoCotizacion | "Todos">("Todos");
  const tabs: Array<EstadoCotizacion | "Todos"> = ["Todos", "Solicitado", "Observado", "Aceptado", "Cancelado"];

  const filtradas = filtro === "Todos" ? resumenes : resumenes.filter((q) => q.estado === filtro);

  const conteo = (tab: EstadoCotizacion | "Todos") =>
    tab === "Todos" ? resumenes.length : resumenes.filter(q => q.estado === tab).length;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${day} ${months[parseInt(month) - 1]}. ${year}`;
  };

  const handleViewCotizacion = (id: number, version: number) => {
    navigate('/quotes/view', { state: { id, version } });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-brand-dark mb-2">
            Mis Cotizaciones
          </h1>
          <p className="text-brand-muted text-sm mb-4">
            Revisa y gestiona las cotizaciones que has solicitado.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-2 py-1.5 bg-primary2/15 text-primary-hover font-semibold rounded text-xs">
              {`${filtradas.length} cotizaci${filtradas.length !== 1 ? 'ones' : 'ón'}`}
            </span>
          </div>

          {/* Chips de filtro */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const n = conteo(tab);
              const activo = filtro === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFiltro(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activo
                      ? 'bg-primary-hover text-white'
                      : 'text-brand-muted hover:bg-brand-light/40'
                  }`}
                >
                  {tab}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activo
                      ? 'bg-white/25 text-white'
                      : 'bg-primary2/15 text-primary-hover'
                  }`}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Listado de cotizaciones */}
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-brand-muted">
            <ShoppingBag size={40} className="mb-3 text-primary2/30" />
            <p className="text-sm">No hay cotizaciones en este estado.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtradas.map((cotizacion) => (
              <button
                key={`${cotizacion.id}-${cotizacion.version}`}
                onClick={() => handleViewCotizacion(cotizacion.id, cotizacion.version)}
                className="w-full text-left bg-brand-light/30 rounded-lg px-4 py-3 hover:bg-brand-light/50 hover:shadow-sm cursor-pointer transition-all flex justify-between items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-dark">COT-N° {cotizacion.id}</span>
                    <StatusBadge estado={cotizacion.estado} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-muted">
                    <Store className="w-3.5 h-3.5" /> <span>Comerciante: {cotizacion.comerciante}</span>
                  </div>
                  <div className="text-[11px] text-brand-muted/70 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Solicitado el {formatDate(cotizacion.fechaSolicitud)}
                  </div>
                </div>
                <div className="text-right space-y-0.5 shrink-0">
                  <span className="text-sm font-bold text-primary-hover">S/ {cotizacion.total.toFixed(2)}</span>
                  <div className="text-[10px] text-brand-muted/70 font-bold flex items-center justify-end gap-1">
                    <Hash className="w-2.5 h-2.5" /> v{cotizacion.version} · {cotizacion.cantidadProductos} prod.
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-muted/40 ml-auto" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
