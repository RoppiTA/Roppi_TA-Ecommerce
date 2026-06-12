import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateProductGenericoDTO, ProductoGenerico } from '../../types/producto/productoGen.types';
import { CategoryForm } from './CategoryForm';
import { MensajeModal } from '../../components/MensajeModal';
import assets from '../../assets/assets';

interface ProductListProps {
  products: ProductoGenerico[];
  onAddProduct: () => void;
  onAddProducto: (dto: CreateProductGenericoDTO) => Promise<ProductoGenerico>;
}

export function ProductList({ products, onAddProduct, onAddProducto }: ProductListProps) {
  const navigate = useNavigate();
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  const [mensajeModal, setMensajeModal] = useState<{ texto?: string; tipo: 'exito' | 'error' | 'cargando' } | null>(null);

  const handleSaveProduct = async (dto: CreateProductGenericoDTO) => {
    setIsNewProductModalOpen(false);
    setMensajeModal({ tipo: 'cargando', texto: 'Guardando producto...' });
    try {
      await onAddProducto(dto);
      setMensajeModal({ texto: 'Producto registrado exitosamente', tipo: 'exito' });
    } catch {
      setMensajeModal({ texto: 'Error al registrar producto', tipo: 'error' });
    }
  };

  const handleViewProduct = (id: number) => {
    navigate('/comerciante/products/view/', { state: { productoId: id } });
  };

  const getBadge = (activo: number) => {
    if (activo === 1) return { label: 'ACTIVO', classes: 'bg-primary2/15 text-primary-hover' };
    return { label: 'INACTIVO', classes: 'bg-brand-muted/15 text-brand-muted' };
  };

  return (
    <div>
      {/* ── Encabezado ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-dark mb-2">
          Gestión de Productos
        </h1>
        <p className="text-brand-muted text-sm mb-4">
          Administra el catálogo de productos personalizables de tu negocio.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          <span className="px-2 py-1.5 bg-primary2/15 text-primary-hover font-semibold rounded text-xs">
            {`${products.length} producto${products.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Botón original — mantiene la navegación a la ruta actual */}
          <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-primary-hover text-white rounded-lg hover:bg-primary2 flex items-center gap-2 text-sm transition-colors"
          >
            <Plus size={16} />
            Agregar Producto
          </button>

          {/* Botón auxiliar — abre CategoryForm como modal para pruebas */}
          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="px-4 py-2 border border-primary-hover text-primary-hover rounded-lg hover:bg-brand-light flex items-center gap-2 text-sm transition-colors"
          >
            <Plus size={16} />
            Nuevo Producto (modal)
          </button>
        </div>
      </div>

      {/* ── Grilla de productos — 4 por fila en desktop ── */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-brand-muted">
          <Package size={40} className="mb-3 text-primary2/30" />
          <p className="text-sm">No hay productos en el catálogo. Agrega uno con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const imagenFiltrada = assets[product.imagen as keyof typeof assets];
            const badge = getBadge(product.activo);

            return (
              <div
                key={product.id}
                onClick={() => handleViewProduct(product.id)}
                className="bg-white rounded-lg border border-primary-hover/20 overflow-hidden hover:shadow-md hover:border-primary2/40 cursor-pointer transition-all"
              >
                {/* Imagen */}
                <div className="aspect-[4/3] overflow-hidden bg-brand-light/40">
                  {imagenFiltrada ? (
                    <img
                      src={imagenFiltrada}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={28} className="text-primary2/30" />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <h3 className="font-semibold text-xs text-brand-dark leading-tight line-clamp-2">
                      {product.nombre}
                    </h3>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>

                  {product.descripcion && (
                    <p className="text-[11px] text-brand-muted line-clamp-1 mb-2">
                      {product.descripcion}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1.5">
                    {product.precio_base > 0 ? (
                      <span className="px-1.5 py-0.5 bg-primary2/15 text-primary-hover font-bold rounded text-[11px]">
                        S/ {product.precio_base.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-brand-muted">Sin precio</span>
                    )}
                    {product.maximo_stock > 0 && (
                      <span className="text-[11px] text-brand-muted">
                        Máx. {product.maximo_stock} u.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal de mensaje (éxito / error) ── */}
      {mensajeModal && (
        <MensajeModal
          mensaje={mensajeModal.texto}
          tipo={mensajeModal.tipo}
          onClose={() => setMensajeModal(null)}
        />
      )}

      {/* ── Modal auxiliar de nuevo producto ── */}
      {isNewProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsNewProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CategoryForm
              onClose={() => setIsNewProductModalOpen(false)}
              onSave={(dto) => handleSaveProduct(dto)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
