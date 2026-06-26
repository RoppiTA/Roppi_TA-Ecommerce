import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductosGenericos } from '../../hooks/useProductos';
import { ProductList } from './ProductList';
import { ProductFilters } from '../../components/ProductFilters';
import { FiltrosGenericos } from '../../api/productos.api';

const ProductListPage = () => {
  const navigate = useNavigate();
  const { productos, loading, error, aplicarFiltros, addProducto } = useProductosGenericos();

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosGenericos>({});

  const handleFilterChange = (nuevosFiltros: FiltrosGenericos) => {
    setFiltrosActivos(nuevosFiltros);
    if (aplicarFiltros) {
      aplicarFiltros(nuevosFiltros);
    }
  };

  return (
    <div className="flex-1 flex gap-6 p-8 min-h-0 overflow-y-auto">
      <ProductFilters onFilterChange={handleFilterChange} />

      <div className="flex-1 min-w-0">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-8 h-full">
            <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
              <h3 className="text-red-800 font-bold text-lg mb-2">Error de conexión</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center p-8 h-full">
            <p className="text-lg font-medium text-muted-foreground animate-pulse">Cargando productos...</p>
          </div>
        ) : (
          <ProductList
            products={productos}
            onAddProduct={() => {}}
            onAddProducto={addProducto}
          />
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
