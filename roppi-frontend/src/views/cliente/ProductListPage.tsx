import { useNavigate } from 'react-router-dom';
import { useProductosGenericos } from '../../hooks/useProductos';
import { ProductList } from './ProductList';

const ProductListPage = () => {
  const navigate = useNavigate();
  const { productos, loading, error } = useProductosGenericos();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg font-medium text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <h3 className="text-red-800 font-bold text-lg mb-2">Error de conexión</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8">
      <ProductList
        products={productos}
      />
    </div>
  );
};

export default ProductListPage;
