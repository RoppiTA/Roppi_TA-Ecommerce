import { useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Hash, ChevronRight, ShoppingBag, UserCheck } from "lucide-react";
import { useCotizaciones } from "../../../hooks/useCotizaciones";
import { StatusBadge } from "../../../components/StatusBadge";
import { EstadoCotizacion } from "../../../types/cotizacion/cotizacion.types";

const ESTADOS_POR_GRUPO: Record<string, EstadoCotizacion[]> = {
  open:   ['Solicitado', 'Observado'],
  closed: ['Aceptado', 'Cancelado', 'Vencido'],
  all:    ['Solicitado', 'Observado', 'Aceptado', 'Cancelado', 'Vencido'],
};

export function ComercianteCotizacionListScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCotizacionesResumen } = useCotizaciones();
  const [seleccion, setSeleccion] = useState<Set<EstadoCotizacion>>(new Set());

  const grupo = searchParams.get('status') ?? 'all';
  const estadosGrupo = ESTADOS_POR_GRUPO[grupo] ?? ESTADOS_POR_GRUPO.all;

  const resumenes = getCotizacionesResumen();
  const enGrupo = resumenes.filter(q => estadosGrupo.includes(q.estado));

  // Solo considera seleccionados los que pertenecen al grupo actual
  const seleccionActiva = new Set([...seleccion].filter(e => estadosGrupo.includes(e)));
  const filtradas = seleccionActiva.size > 0
    ? enGrupo.filter(q => seleccionActiva.has(q.estado))
    : enGrupo;

  const conteo = (estado: EstadoCotizacion) => enGrupo.filter(q => q.estado === estado).length;

  const toggleEstado = (estado: EstadoCotizacion) => {
    setSeleccion(prev => {
      const next = new Set(prev);
      if (next.has(estado)) next.delete(estado);
      else next.add(estado);
      return next;
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* ── Encabezado ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-brand-dark mb-2">
            Panel de Cotizaciones
          </h1>
          <p className="text-brand-muted text-sm mb-4">
            Gestiona y resuelve las solicitudes de cotización de tus clientes.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-2 py-1.5 bg-primary2/15 text-primary-hover font-semibold rounded text-xs">
              {`${filtradas.length} cotizaci${filtradas.length !== 1 ? 'ones' : 'ón'}`}
            </span>
          </div>

          {/* Chips de filtro — solo los estados del grupo actual */}
          <div className="flex flex-wrap gap-2">
            {estadosGrupo.map((estado) => {
              const n = conteo(estado);
              const activo = seleccionActiva.has(estado);
              return (
                <button
                  key={estado}
                  onClick={() => toggleEstado(estado)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activo
                      ? 'bg-primary-hover text-white'
                      : 'text-brand-muted hover:bg-brand-light/40'
                  }`}
                >
                  {estado}
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

        {/* ── Listado de cotizaciones ── */}
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-brand-muted">
            <ShoppingBag size={40} className="mb-3 text-primary2/30" />
            <p className="text-sm">No hay registros en esta sección.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtradas.map((c) => (
              <button
                key={`${c.id}-${c.version}`}
                onClick={() => navigate('/comerciante/quotes/view', { state: { id: c.id, version: c.version } })}
                className="w-full text-left bg-brand-light/30 rounded-lg px-4 py-3 hover:bg-brand-light/50 hover:shadow-sm cursor-pointer transition-all flex justify-between items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-dark">COT-N° {c.id}</span>
                    <StatusBadge estado={c.estado} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-muted">
                    <UserCheck className="w-3.5 h-3.5" /> <span>Cliente: {c.cliente}</span>
                  </div>
                  <div className="text-[11px] text-brand-muted/70 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Solicitado el {c.fechaSolicitud}
                  </div>
                </div>
                <div className="text-right space-y-0.5 shrink-0">
                  <span className="text-sm font-bold text-primary-hover">S/ {c.total.toFixed(2)}</span>
                  <div className="text-[10px] text-brand-muted/70 font-bold flex items-center justify-end gap-1">
                    <Hash className="w-2.5 h-2.5" /> v{c.version} · {c.cantidadProductos} unds.
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
