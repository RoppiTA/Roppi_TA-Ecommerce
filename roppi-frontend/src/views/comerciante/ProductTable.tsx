import { ProductoGenerico } from '../../types/producto/productoGen.types';

interface Props {
  products: ProductoGenerico[];
  onViewProduct: (id: number) => void;
}

const PRODUCT_EMOJIS = ['👕', '🧢', '🧥', '👟', '👜', '🧣', '🧤', '👗'];

export function ProductTable({ products, onViewProduct }: Props) {
  const getBadge = (activo: number) => {
    if (activo === 1) return { label: 'ACTIVO', classes: 'bg-green-100 text-green-700' };
    return { label: 'INACTIVO', classes: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                Detalles del Producto
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                Límite de Producción
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                Precio Base
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const badge = getBadge(product.activo);
              return (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                  onClick={() => onViewProduct(product.id)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {PRODUCT_EMOJIS[index % PRODUCT_EMOJIS.length]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{product.nombre}</div>
                        {product.descripcion && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {product.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-sm font-medium">
                      {product.maximo_stock > 0 ? `${product.maximo_stock} unidades` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-sm">
                    {product.precio_base > 0 ? `S/ ${product.precio_base.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No hay productos en el catálogo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
