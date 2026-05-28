/*ESTO TODO ES UN DUMMY para prueba de funcionamiento.
Si es necesario usar como ejemplo para cargar e insertar datos
a la pantalla final */
import { useNavigate } from 'react-router-dom';
import { useDiscounts } from '../../hooks/useDiscounts';

export const DiscountsScreen = () => {
  const navigate = useNavigate();
  const { discounts, deleteDiscount } = useDiscounts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🏷️ Campañas de Descuento Activas</h2>
        <button onClick={() => navigate('/discounts/new')} style={{ background: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
          + Crear Cupón
        </button>
      </div>
      <ul>
        {discounts.map(d => (
          <li key={d.id} style={{ margin: '10px 0', background: 'white', padding: '10px' }}>
            Código: <strong>{d.code}</strong> - Descuento: {d.percentage}%
            <button onClick={() => navigate(`/discounts/edit/${d.id}`)} style={{ marginLeft: '20px' }}>Editar</button>
            <button onClick={() => deleteDiscount(d.id)} style={{ marginLeft: '10px' }}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default DiscountsScreen;