import { useState } from 'react';
import { ProductList } from './ProductList';
import { DiscountTable } from './DiscountTable';
import { DiscountModal } from './DiscountModal';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import { Descuento } from '../../types/producto/descuento.types';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

export const DefaultComerciante = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductoGenerico[]>([
    {
      id: 1,
      nombre: 'Blusa Casual',
      descripcion: 'Blusa elegante perfecta para el día a día',
      precio_base: 0,
      activo: 1,
      maximo_stock: 0,
      colores: [], materiales: [], tamanos: [], personalizaciones:[]
    },
    {
      id: 2,
      nombre: 'Camisas Variadas',
      descripcion: 'Colección de camisas en diferentes colores',
      precio_base: 0,
      activo: 1,
      maximo_stock: 0,
      colores: [], materiales: [], tamanos: [], personalizaciones:[]
    },
    {
      id: 3,
      nombre: 'Ropa Boutique',
      descripcion: 'Selección exclusiva de boutique',
      precio_base: 0,
      activo: 1,
      maximo_stock: 0,
      colores: [], materiales: [], tamanos: [], personalizaciones:[]
    },
    {
      id: 4,
      nombre: 'Ropa de Pared',
      descripcion: 'Colección de ropa colgada en rack de madera',
      precio_base: 0,
      activo: 1,
      maximo_stock: 0,
      colores: [], materiales: [], tamanos: [], personalizaciones:[]
    },
    {
      id: 5,
      nombre: 'Camisas Premium',
      descripcion: 'Camisas de alta calidad en perchero',
      precio_base: 0,
      activo: 1,
      maximo_stock: 0,
      colores: [], materiales: [], tamanos: [], personalizaciones:[]
    },
    {
      id: 6,
      nombre: 'Ropa Colorida',
      descripcion: 'Variedad de ropa en colores vibrantes',
      precio_base: 0,
      activo: 1,
      maximo_stock: 0,
      colores: [], materiales: [], tamanos: [], personalizaciones:[]
    },
  ]);

  const [discounts, setDiscounts] = useState<Descuento[]>([
    {
      id: 1,
      nombre: 'Descuento de Verano',
      cantidad: 2,
      porcentajeDescuento: 15,
      idGenericoVinculados: [1, 2],
    },
    {
      id: 2,
      nombre: 'Oferta Especial',
      cantidad: 3,
      porcentajeDescuento: 25,
      idGenericoVinculados: [3, 4, 5],
    },
  ]);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Descuento | null>(null);

  const handleAddProduct = () => {
    navigate('/products/new');
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setDiscountModalOpen(true);
  };

  const handleEditDiscount = (discount: Descuento) => {
    setEditingDiscount(discount);
    setDiscountModalOpen(true);
  };

  const handleSaveDiscount = (discount: Descuento) => {
    if (editingDiscount) {
      setDiscounts(discounts.map(d => d.id === discount.id ? discount : d));
    } else {
      setDiscounts([...discounts, { ...discount, id: 15 }]); // faltaria ver la logica para esto del id
    }
    setDiscountModalOpen(false);
    setEditingDiscount(null);
  };

  const handleDeleteDiscount = (id: number) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-8">Gestión de Productos y Descuentos</h1>

        <ProductList
          products={products}
          onAddProduct={handleAddProduct}
        />

        <div className="mt-12">
          <DiscountTable
            discounts={discounts}
            products={products}
            onAddDiscount={handleAddDiscount}
            onEditDiscount={handleEditDiscount}
            onDeleteDiscount={handleDeleteDiscount}
          />
        </div>
      </div>

      <DiscountModal
        open={discountModalOpen}
        discount={editingDiscount}
        products={products}
        onClose={() => {
          setDiscountModalOpen(false);
          setEditingDiscount(null);
        }}
        onSave={handleSaveDiscount}
      />
    </div>
  );
};
export default DefaultComerciante;