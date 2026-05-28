import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';

export const ProductsScreen = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct } = useProducts();

  if (loading) return <p>Consultando base de datos relacional de Gamarra...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>📦 Panel de Ropa Base (Genéricos)</h2>
        <button onClick={() => navigate('/products/new')} style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>+ Registrar Genérico</button>
      </div>
      {products.map(p => (
        <div key={p.id} style={{ background: 'white', padding: '20px', marginBottom: '10px', borderRadius: '6px', borderLeft: '5px solid #2563eb' }}>
          <h4>{p.nombre} (ID BD: {p.id})</h4>
          <p>Precio Base: S/. {p.precio_base} | Máx Stock: {p.maximo_stock} unids.</p>
          <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
            Atributos Vinculados: {(p.tamanos || []).length} Tamaños | {(p.materiales || []).length} Materiales
          </span>
          <div style={{ marginTop: '15px' }}>
            <button onClick={() => navigate(`/products/edit/${p.id}`)}>Editar Parámetros/Cruces</button>
            <button onClick={() => deleteProduct(p.id)} style={{ marginLeft: '10px', color: 'white', background: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Eliminar Cascada</button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ProductsScreen;