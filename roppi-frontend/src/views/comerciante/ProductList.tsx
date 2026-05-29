import { Button } from '@mui/material';
import { Plus } from 'lucide-react';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

interface ProductListProps {
  products: ProductoGenerico[];
  onAddProduct: () => void;
}

export function ProductList({ products, onAddProduct }: ProductListProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleViewProduct = (id:number) => {
    navigate('/products/view/${id}');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Productos</h2>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={onAddProduct}
        >
          Agregar Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => handleViewProduct(product.id)}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={assets.maxwell}
                alt={product.nombre}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2">{product.nombre}</h3>
              <p className="text-gray-600">{product.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>  
  );
}
