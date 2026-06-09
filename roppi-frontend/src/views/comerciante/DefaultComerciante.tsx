import { useState } from 'react';
import { Plus, Percent, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductosGenericos, useDescuentos } from '../../hooks/useProductos';
import { CreateDescuentoDTO } from '../../types/producto/descuento.types';
import { ProductTable } from './ProductTable';
import { MetricsSection } from './MetricsSection';
import { CategoryForm } from './CategoryForm';
import { DiscountForm } from './DiscountForm';

export const DefaultComerciante = () => {
  const navigate = useNavigate();
  const { productos, loading: loadingProductos, error: errorProductos } = useProductosGenericos();
  const { descuentos, loading: loadingDescuentos, addDescuento } = useDescuentos();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const handleSaveDiscount = async (discount: CreateDescuentoDTO) => {
    try {
      await addDescuento(discount);
    } catch {
      // error ya manejado en el hook
    }
  };

  const handleViewProduct = (id: number) => {
    navigate('products/view/', { state: { productoId: id } });
  };

  if (loadingProductos) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg font-medium text-brand-muted">
          Cargando productos desde el catálogo...
        </p>
      </div>
    );
  }

  if (errorProductos) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <h3 className="text-red-800 font-bold text-lg mb-2">Error de conexión</h3>
          <p className="text-red-600">{errorProductos}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Contenido de la página */}
        <div className="p-6">
          {/* Encabezado de la página */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2 text-brand-dark">
              Administración de productos y descuentos
            </h1>
            <p className="text-brand-muted mb-4">
              Crea nuevas ofertas promocionales, ajusta el inventario y aplica estrategias
              de precios escalonados por categoría.
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-2 py-1.5 bg-primary2/15 text-primary-hover font-semibold rounded text-xs">
                {loadingDescuentos ? '...' : `${descuentos.length} descuentos activos`}
              </span>
              <span className="px-2 py-1.5 bg-brand-light text-brand-dark font-semibold rounded text-xs">
                {`${productos.length} productos en catálogo`}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDiscountModal(true)}
                className="px-4 py-2 bg-primary-hover text-white rounded-lg hover:bg-primary2 flex items-center gap-2 text-sm transition-colors"
              >
                <Percent size={16} />
                Agregar Descuento
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-primary-hover text-white rounded-lg hover:bg-primary2 flex items-center gap-2 text-sm transition-colors"
              >
                <Plus size={18} />
                Agregar Producto
              </button>
            </div>
          </div>

          {/* Inventario activo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-dark">Inventario activo</h2>
              <button className="text-sm text-primary2 hover:underline transition-colors">
                VER CATÁLOGO COMPLETO →
              </button>
            </div>
            <ProductTable products={productos} onViewProduct={handleViewProduct} />
          </div>

          {/* Métricas */}
          <MetricsSection
            productCount={productos.length}
            discountCount={loadingDescuentos ? 0 : descuentos.length}
          />

        </div>

      {/* Modal: Agregar Producto */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-3 right-3 z-10 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <CategoryForm />
          </div>
        </div>
      )}

      {/* Modal: Agregar Descuento */}
      {showDiscountModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowDiscountModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* [refactor] El X ahora lo gestiona DiscountForm via onClose — 2025-06 */}
            <DiscountForm
              products={productos}
              discounts={descuentos}
              onSave={handleSaveDiscount}
              onClose={() => setShowDiscountModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultComerciante;
