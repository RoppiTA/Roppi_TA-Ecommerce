interface Props {
  productCount: number;
  discountCount: number;
}

export function MetricsSection({ productCount, discountCount }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="text-xs text-muted-foreground uppercase mb-2">
          Total de Productos
        </div>
        <div className="text-3xl font-semibold mb-3">{productCount}</div>
        <div className="text-xs text-muted-foreground">Productos en el catálogo activo</div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <div className="text-xs text-muted-foreground uppercase mb-2">
          Descuentos Actuales
        </div>
        <div className="text-3xl font-semibold mb-3">{discountCount} Reglas</div>
        <div className="text-xs text-muted-foreground">Reglas de descuento configuradas</div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <div className="text-xs text-muted-foreground uppercase mb-2">
          Porcentaje de Producción Semanal
        </div>
        <div className="text-3xl font-semibold mb-3">94.2%</div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '94.2%' }} />
        </div>
        <div className="text-xs text-muted-foreground">+4% respecto a la semana anterior</div>
      </div>
    </div>
  );
}
