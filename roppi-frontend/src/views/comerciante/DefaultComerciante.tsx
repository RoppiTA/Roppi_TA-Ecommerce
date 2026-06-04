import { useState } from 'react';
import { Bell, Search, Plus, Percent, X } from 'lucide-react';
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
    navigate('/products/view/', { state: { productoId: id } });
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
    <div className="flex flex-1 overflow-hidden">
      {/* Contenido principal */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-brand-light/40 border-b border-primary-hover/15 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex-1 max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary2"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar en el catálogo de productos..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-primary2/25 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-primary2/10 rounded-lg relative transition-colors">
              <Bell size={20} className="text-brand-dark" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full" />
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-primary-hover text-white rounded-full flex items-center justify-center text-sm font-medium">
                RC
              </div>
              <span className="text-sm font-medium hidden sm:block text-brand-dark">Roppi Comerciante</span>
            </div>
          </div>
        </header>

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
                className="px-4 py-2 border border-primary2/40 text-primary2 rounded-lg hover:bg-primary2/10 flex items-center gap-2 text-sm transition-colors"
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
            className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDiscountModal(false)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <DiscountForm
              products={productos}
              discounts={descuentos}
              onSave={handleSaveDiscount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultComerciante;
