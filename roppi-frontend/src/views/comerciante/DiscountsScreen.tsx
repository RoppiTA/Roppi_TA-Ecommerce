import { useNavigate } from 'react-router-dom';
import { useDiscounts } from '../../hooks/useDiscounts';

export const DiscountsScreen = () => {
  const navigate = useNavigate();
  const { discounts, deleteDiscount } = useDiscounts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>🏷️ Campañas de Descuento (Roppi TA)</h2>
        <button onClick={() => navigate('/discounts/new')} style={{ padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>+ Nuevo Descuento</button>
      </div>
      {discounts.map(d => (
        <div key={d.id} style={{ background: 'white', padding: '20px', marginBottom: '10px', borderRadius: '6px' }}>
          <h4>{d.nombre}</h4>
          <p>Rebaja: {d.porcentajeDescuento}% | Disponibles: {d.cantidad} cupones</p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Asociado a Genérico ID: {d.idGenericoVinculados.join(', ') || 'Global'}</p>
          <button onClick={() => navigate(`/discounts/edit/${d.id}`)}>Editar</button>
          <button onClick={() => deleteDiscount(d.id)} style={{ marginLeft: '10px', color: 'red' }}>Eliminar</button>
        </div>
      ))}
    </div>
  );
};
export default DiscountsScreen;