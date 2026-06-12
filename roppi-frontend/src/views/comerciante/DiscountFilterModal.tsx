import { X } from 'lucide-react';

interface Product {
  id: number;
  nombre: string;
}

interface Props {
  products: Product[];
  onClose: () => void;
  onSelect: (productId: number) => void;
}

export function DiscountFilterModal({
  products,
  onClose,
  onSelect
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">
            Seleccionar Producto
          </h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className="w-full text-left px-4 py-3 hover:bg-brand-light/20 border-b"
            >
              {product.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}