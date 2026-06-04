import { Percent, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateDescuentoDTO, Descuento } from '../../types/producto/descuento.types';
import { ProductoGenerico } from '../../types/producto/productoGen.types';

interface Props {
  products: ProductoGenerico[];
  discounts: Descuento[];
  onSave: (discount: CreateDescuentoDTO) => void;
}

export function DiscountForm({ products, discounts, onSave }: Props) {
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const handleActivar = () => {
    if (!nombre.trim()) return;
    onSave({
      nombre,
      cantidad: selectedProductIds.length,
      porcentajeDescuento: Number(porcentaje) || 0,
      idGenericoVinculados: selectedProductIds,
    });
    setNombre('');
    setPorcentaje('');
    setSelectedProductIds([]);
  };

  const availableProducts = products.filter(
    (p) =>
      !selectedProductIds.includes(p.id) &&
      p.nombre.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="bg-[#001736] p-6">
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
              <label className="block text-[11px] font-bold text-[#43474f] uppercase tracking-wider mb-2">
                Nombre de la regla
              </label>
              <input
                type="text"
                placeholder="e.g., SEASONAL_CLEARANCE"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#e6e8ea] border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#43474f] uppercase tracking-wider mb-2">
                Valor de descuento (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="20"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2.5 bg-[#e6e8ea] border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474f] font-bold text-sm">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#43474f] uppercase tracking-wider mb-2">
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
                        className="inline-flex items-center gap-1.5 bg-[#e0e3e5] text-[#001736] px-3 py-1.5 rounded-full text-xs font-semibold"
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
                  className="w-8 h-8 border border-dashed border-[#747780] rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Plus size={14} className="text-[#43474f]" />
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
                    className="w-full px-3 py-2 bg-[#e6e8ea] border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {availableProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {availableProducts.map((p) => (
                        <button
                          key={p.id}
                          onMouseDown={() => addProduct(p.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50"
                        >
                          {p.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                  {productSearch && availableProducts.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-sm z-10 px-3 py-2 text-xs text-muted-foreground">
                      Sin resultados
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {discounts.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-[#43474f] uppercase tracking-wider mb-2">
              Descuentos activos
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {discounts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between bg-[#f2f4f6] rounded px-3 py-2"
                >
                  <span className="text-sm font-medium text-[#001736]">{d.nombre}</span>
                  <span className="text-xs text-teal-600 font-bold">{d.porcentajeDescuento}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleActivar}
            className="w-full py-3 rounded text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgb(0, 23, 54) 0%, rgb(0, 43, 91) 100%)',
            }}
          >
            Activar Promoción
          </button>
        </div>
      </div>
    </div>
  );
}
