/*ESTO TODO ES UN DUMMY para prueba de funcionamiento.
Si es necesario usar como ejemplo para cargar e insertar datos
a la pantalla final */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { CreateProductDTO } from '../../types/product.types';

export const ProductFormScreen = () => {
  const { id } = useParams<{ id: string }>(); // El id capturado ya es un string directo
  const navigate = useNavigate();
  
  const { currentProduct, loading, createProduct, updateProduct } = useProducts(id);
  const isEditMode = Boolean(id);

  // Inicializador basado en el contrato original
  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    price: 0,
    stock: 0,
    category: 'Polos Estampados',
  });

  useEffect(() => {
    if (isEditMode && currentProduct) {
      setFormData({
        name: currentProduct.name,
        price: currentProduct.price,
        stock: currentProduct.stock,
        category: currentProduct.category,
      });
    }
  }, [isEditMode, currentProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'stock' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && id) {
        await updateProduct(id, formData);
        alert('Producto modificado exitosamente');
      } else {
        await createProduct(formData);
        alert('Producto guardado en memoria estática');
      }
      navigate('/products');
    } catch (err) {
      alert('Error en el envío');
    }
  };

  if (loading && isEditMode) return <div>Preparando el formulario...</div>;

  return (
    <div>
      <h2>{isEditMode ? '⚙️ Modo Edición' : '➕ Modo Creación'}</h2>
      
      {/* Todo el bloque del form inferior puede ser reemplazado por tus componentes visuales de Figma */}
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '500px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Precio (S/.):</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Stock:</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Categoría:</label>
          <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="Polos Estampados">Polos Estampados</option>
            <option value="Poleras">Poleras</option>
            <option value="Camisas">Camisas</option>
          </select>
        </div>

        <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isEditMode ? 'Guardar Cambios' : 'Registrar'}
        </button>
        <button type="button" onClick={() => navigate('/products')} style={{ marginLeft: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          Volver
        </button>
      </form>
    </div>
  );
};

export default ProductFormScreen;