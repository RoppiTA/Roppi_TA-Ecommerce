import { Bell, Search, Plus, Download } from 'lucide-react';
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
        <p className="text-lg font-medium text-muted-foreground">
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
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar en el catálogo de productos..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-accent rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                RC
              </div>
              <span className="text-sm font-medium hidden sm:block">Roppi Comerciante</span>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <div className="p-6">
          {/* Encabezado de la página */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">
              Administración de productos y descuentos
            </h1>
            <p className="text-muted-foreground mb-4">
              Crea nuevas ofertas promocionales, ajusta el inventario y aplica estrategias
              de precios escalonados por categoría.
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded text-xs">
                {loadingDescuentos ? '...' : `${descuentos.length} descuentos activos`}
              </span>
              <span className="px-2 py-1.5 bg-purple-100 text-purple-700 rounded text-xs">
                {`${productos.length} productos en catálogo`}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent flex items-center gap-2 text-sm">
                <Download size={16} />
                Exportar en excel
              </button>
              <button
                onClick={() => navigate('/products/new')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 text-sm"
              >
                <Plus size={18} />
                Agregar Producto
              </button>
            </div>
          </div>

          {/* Inventario activo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Inventario activo</h2>
              <button className="text-sm text-primary hover:underline">
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

          {/* Formularios */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <CategoryForm />
            <DiscountForm
              products={productos}
              discounts={descuentos}
              onSave={handleSaveDiscount}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default DefaultComerciante;
