/*ESTO TODO ES UN DUMMY para prueba de funcionamiento.
Si es necesario usar como ejemplo para cargar e insertar datos
a la pantalla final */
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';

export const ProductsScreen = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct } = useProducts();

  if (loading) return <div>Leyendo catálogo textil de Roppi...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👕 Catálogo de Productos</h2>
        <button onClick={() => navigate('/products/new')} style={{ background: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          + Agregar Producto
        </button>
      </div>
      
      <ul style={{ padding: 0 }}>
        {products.map(p => (
          <li key={p.id} style={{ margin: '10px 0', background: 'white', padding: '15px', borderRadius: '5px', listStyle: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <strong>{p.name}</strong> - S/. {p.price.toFixed(2)} <br/>
            <small>Categoría: {p.category} | Stock: {p.stock} unidades</small>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => navigate(`/products/edit/${p.id}`)}>Editar</button>
              <button onClick={() => deleteProduct(p.id)} style={{ marginLeft: '10px', color: 'red' }}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsScreen;