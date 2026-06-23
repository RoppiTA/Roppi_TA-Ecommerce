import { ClockIcon, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { EstadoCotizacion } from "../types/cotizacion/cotizacion.types";

export const STATUS_CONFIG: Record<
  EstadoCotizacion,
  { label: string; bg: string; text: string; border: string; Icon: React.FC<{ className?: string }> }
> = {
  Solicitado: {
    label: "Solicitado",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    Icon: ClockIcon,
  },
  Observado: {
    label: "Observado",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    Icon: AlertCircle,
  },
  Aceptado: {
    label: "Aceptado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    Icon: CheckCircle,
  },
  Cancelado: {
    label: "Cancelado",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    Icon: XCircle,
  },
};

interface StatusBadgeProps {
  estado: EstadoCotizacion;
  size?: "sm" | "md";
}

export function StatusBadge({ estado, size = "sm" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[estado] || STATUS_CONFIG["Solicitado"];
  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const textSize = size === "md" ? "text-sm" : "text-xs";
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold ${cfg.bg} ${cfg.text} ${cfg.border} ${textSize}`}>
      <cfg.Icon className={iconSize} />
      {cfg.label}
    </span>
  );
}