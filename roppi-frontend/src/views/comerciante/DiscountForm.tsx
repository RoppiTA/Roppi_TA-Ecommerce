import { Percent, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateDescuentoDTO, Descuento } from '../../types/producto/descuento.types';
import { ProductoGenerico } from '../../types/producto/productoGen.types';

const blockNonInteger = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
};

// [feat] Props extendidas para soportar modo edición (initialData) y cierre modal (onClose) — 2025-06
interface Props {
  products: ProductoGenerico[];
  discounts: Descuento[];
  onSave: (discount: CreateDescuentoDTO) => void;
  onClose?: () => void;       // opcional: muestra botón X en el header cuando se usa como modal
  initialData?: Descuento;    // opcional: precarga el formulario para edición
}

export function DiscountForm({ products, discounts, onSave, onClose, initialData }: Props) {
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [cantidad, setCantidad] = useState('0');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; porcentaje?: string }>({});

  // [feat] Precarga de datos cuando se abre en modo edición — 2025-06
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setPorcentaje(String(initialData.porcentajeDescuento));
      setCantidad(String(initialData.cantidad));
      setSelectedProductIds(initialData.idGenericoVinculados);
    } else {
      setNombre('');
      setPorcentaje('');
      setCantidad('0');
      setSelectedProductIds([]);
    }
    setErrors({});
  }, [initialData]);

  const removeProduct = (id: number) => {
    setSelectedProductIds(selectedProductIds.filter((pid) => pid !== id));
  };

  const addProduct = (id: number) => {
    if (!selectedProductIds.includes(id)) {
      setSelectedProductIds([...selectedProductIds, id]);
    }
    setProductSearch('');
    setShowSearch(false);
  };

  // Validar datos del formulario
  const validarFormulario = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    const porcentajeNum = Number(porcentaje);
    if (!porcentaje || porcentajeNum <= 0 || porcentajeNum > 100) {
      newErrors.porcentaje = 'El porcentaje debe ser mayor a 0 y menor o igual a 100';
    }

    const cantidadNum = Number(cantidad);
    if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
      newErrors.cantidad = 'La cantidad debe ser un número entero positivo';
    }

    if (selectedProductIds.length === 0) {
      newErrors.productos = 'Se debe seleccionar al menos una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    const newErrors: { nombre?: string; porcentaje?: string } = {};
    if (!nombre.trim()) newErrors.nombre = 'Debe completar este campo';
    if (!porcentaje.trim()) newErrors.porcentaje = 'Debe completar este campo';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    // [feat] cantidad ahora viene del campo de texto, no del conteo de productos — 2025-06
    onSave({
      nombre,
      cantidad: Number(cantidad),
      porcentajeDescuento: Number(porcentaje),
      idGenericoVinculados: selectedProductIds,
    });
    setNombre('');
    setPorcentaje('');
    setCantidad('0');
    setSelectedProductIds([]);
    setErrors({});
  };

  const availableProducts = products.filter(
    (p) =>
      !selectedProductIds.includes(p.id) &&
      p.nombre.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-primary-hover/20 overflow-hidden">
      {/* [feat] onClose renderiza el botón X sobre el header para uso en modal — 2025-06 */}
      <div className="bg-primary-hover p-6 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            <Percent size={16} className="text-white" />
          </div>
          <h3 className="font-bold text-lg text-white">Promociones en el negocio</h3>
        </div>
        <p className="text-xs text-white/70">
          Reglas de descuento aplicables a las órdenes del cliente
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Nombre de la regla
              </label>
              <input
                type="text"
                placeholder="e.g., SEASONAL_CLEARANCE"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); if (errors.nombre) setErrors(prev => ({ ...prev, nombre: undefined })); }}
                className={`w-full px-3 py-2.5 bg-brand-light/40 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40 ${errors.nombre ? 'border-brand-error' : 'border-primary2/25'}`}
              />
              {errors.nombre && <p className="mt-1 text-xs text-brand-error">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Valor de descuento (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="20"
                  value={porcentaje}
                  onChange={(e) => { const v = e.target.value; if (v === '' || Number(v) >= 0) { setPorcentaje(v); if (errors.porcentaje) setErrors(prev => ({ ...prev, porcentaje: undefined })); } }}
                  min={0}
                  max={100}
                  onKeyDown={blockNonInteger}
                  className={`w-full px-3 py-2.5 bg-brand-light/40 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40 pr-8 ${errors.porcentaje ? 'border-brand-error' : 'border-primary2/25'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474f] font-bold text-sm">
                  %
                </span>
              </div>
              {errors.porcentaje && <p className="mt-1 text-xs text-brand-error">{errors.porcentaje}</p>}
            </div>

            {/* [feat] Campo de cantidad mínima para eligibilidad — 2025-06 */}
            <div>
              <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Cantidad de productos mínimos para eligibilidad
              </label>
              <input
                type="number"
                placeholder="1"
                value={cantidad}
                onChange={(e) => { const v = e.target.value; if (v === '' || Number(v) >= 0) setCantidad(v); }}
                min={0}
                onKeyDown={blockNonInteger}
                className="w-full px-3 py-2.5 bg-brand-light/40 border border-primary2/25 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40"
              />
              {errors.cantidad && <p className="text-xs text-brand-error mt-1">{errors.cantidad}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Productos aplicables
              </label>

              {/* Chips de productos seleccionados */}
              {selectedProductIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedProductIds.map((id) => {
                    const product = products.find((p) => p.id === id);
                    return product ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 bg-brand-light text-primary-hover border border-primary2/30 px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        {product.nombre}
                        <button onClick={() => removeProduct(id)} className="hover:opacity-70">
                          <X size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Botón + y buscador */}
              {!showSearch ? (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-8 h-8 border border-dashed border-primary2/50 rounded-full flex items-center justify-center hover:bg-primary2/10 transition-colors"
                >
                  <Plus size={14} className="text-primary2" />
                </button>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onBlur={() => { setShowSearch(false); setProductSearch(''); }}
                    autoFocus
                    className="w-full px-3 py-2 bg-brand-light/40 border border-primary2/25 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40"
                  />
                  {availableProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary2/25 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {availableProducts.map((p) => (
                        <button
                          key={p.id}
                          onMouseDown={() => addProduct(p.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-brand-light/50 text-brand-dark transition-colors"
                        >
                          {p.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                  {productSearch && availableProducts.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary2/25 rounded-lg shadow-sm z-10 px-3 py-2 text-xs text-brand-muted">
                      Sin resultados
                    </div>
                  )}
                </div>
              )}
              {errors.productos && <p className="text-xs text-brand-error mt-1">{errors.productos}</p>}
            </div>
          </div>

        </div>

        {discounts.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
              Descuentos activos
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {discounts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between bg-brand-light/40 rounded px-3 py-2"
                >
                  <span className="text-sm font-medium text-brand-dark">{d.nombre}</span>
                  <span className="text-xs text-primary2 font-bold">{d.porcentajeDescuento}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpdate}
            className="px-5 py-2 bg-primary-hover text-white rounded-lg text-sm font-semibold hover:bg-primary2 transition-colors"
          >
            Actualizar Descuento
          </button>
        </div>
      </div>
    </div>
  );
}
