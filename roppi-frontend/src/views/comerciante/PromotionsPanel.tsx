import { Percent } from 'lucide-react';
import { useState } from 'react';
import { CreateDescuentoDTO } from '../../types/producto/descuento.types';
import { ProductoGenerico } from '../../types/producto/productoGen.types';

interface Props {
  products: ProductoGenerico[];
  onSave: (discount: CreateDescuentoDTO) => void;
}

export function PromotionsPanel({ products, onSave }: Props) {
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [tipo, setTipo] = useState('Porcentaje (%)');
  const [productInput, setProductInput] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddProduct = () => {
    const found = products.find((p) =>
      p.nombre.toLowerCase().includes(productInput.toLowerCase())
    );
    if (found && !selectedProductIds.includes(found.id)) {
      setSelectedProductIds([...selectedProductIds, found.id]);
    }
    setProductInput('');
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
    setProductInput('');
    setSelectedProductIds([]);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-6 sticky top-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <Percent size={20} />
        </div>
        <div>
          <h3 className="font-semibold">Promociones en el negocio</h3>
          <p className="text-xs opacity-80">Administrar descuentos activos</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 opacity-90">TIPO DE PROMOCIÓN</label>
          <input
            type="text"
            defaultValue="A nivel de producto"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-90">NOMBRE DE LA REGLA</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="e.g., DESCUENTO_VERANO"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-90">TIPO DE DESCUENTO</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option>Porcentaje (%)</option>
            <option>Monto fijo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-90">VALOR (%)</label>
          <input
            type="number"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            placeholder="20"
            min={0}
            max={100}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-90">PRODUCTOS AFECTADOS</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
              placeholder="Nombre del producto"
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/40"
            />
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors"
            >
              +
            </button>
          </div>
          {selectedProductIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedProductIds.map((id) => {
                const p = products.find((pr) => pr.id === id);
                return p ? (
                  <span key={id} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {p.nombre}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-90">VIGENCIA DE DURACIÓN</label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <span>—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/20">
        <button
          onClick={handleActivar}
          className="w-full px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Activar Promoción
        </button>
        <button
          onClick={handleActivar}
          className="w-full mt-2 px-6 py-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          Descartar como borrador
        </button>
      </div>
    </div>
  );
}
