/*ESTO TODO ES UN DUMMY para prueba de funcionamiento.
Si es necesario usar como ejemplo para cargar e insertar datos
a la pantalla final */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiscounts } from '../../hooks/useDiscounts';

export const DiscountFormScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDiscount, loading, createDiscount, updateDiscount } = useDiscounts(id);

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    code: '',
    percentage: 0,
  });

  useEffect(() => {
    if (isEditMode && currentDiscount) {
      setFormData({
        code: currentDiscount.code,
        percentage: currentDiscount.percentage,
      });
    }
  }, [isEditMode, currentDiscount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && id) {
      await updateDiscount(id, formData);
    } else {
      await createDiscount(formData);
    }
    navigate('/discounts');
  };

  if (loading && isEditMode) return <div>Cargando datos de la campaña...</div>;

  return (
    <div>
      <h2>{isEditMode ? '🏷️ Editar Cupón de Descuento' : '🏷️ Crear Nueva Campaña de Descuento'}</h2>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Código del Cupón:</label>
          <input type="text" name="code" value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Porcentaje de Rebaja (%):</label>
          <input type="number" name="percentage" value={formData.percentage} onChange={(e) => setFormData(p => ({ ...p, percentage: Number(e.target.value) }))} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px' }}>
          {isEditMode ? 'Actualizar Oferta' : 'Activar Descuento'}
        </button>
      </form>
    </div>
  );
};

export default DiscountFormScreen;