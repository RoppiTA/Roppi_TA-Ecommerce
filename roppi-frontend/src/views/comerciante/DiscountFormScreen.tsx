import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiscounts } from '../../hooks/useDiscounts';

export const DiscountFormScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const discountId = id ? Number(id) : undefined;
  const isEditMode = Boolean(discountId);

  const { currentDiscount, availableProducts, createDiscount, updateDiscount } = useDiscounts(discountId);

  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [linkedProductId, setLinkedProductId] = useState<number>(0);

  useEffect(() => {
    if (isEditMode && currentDiscount) {
      setNombre(currentDiscount.nombre);
      setCantidad(currentDiscount.cantidad);
      setPorcentaje(currentDiscount.porcentajeDescuento);
      if (currentDiscount.idGenericoVinculados.length > 0) {
        setLinkedProductId(currentDiscount.idGenericoVinculados[0]);
      }
    }
  }, [isEditMode, currentDiscount]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre,
      cantidad,
      porcentajeDescuento: porcentaje,
      idGenericoVinculados: linkedProductId ? [linkedProductId] : []
    };

    if (isEditMode && discountId) {
      await updateDiscount(discountId, payload);
    } else {
      await createDiscount(payload);
    }
    navigate('/discounts');
  };

  return (
    <div>
      <h2>{isEditMode ? '🏷️ Modificar Regla de Descuento' : '🏷️ Registrar Nuevo Descuento'}</h2>
      <form onSubmit={handleSave} style={{ background: 'white', padding: '25px', borderRadius: '6px' }}>
        <input type="text" placeholder="Nombre de Promoción" value={nombre} onChange={e => setNombre(e.target.value)} required /><br/><br/>
        <input type="number" placeholder="Cantidad de Cupones" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} required /><br/><br/>
        <input type="number" step="0.01" placeholder="Porcentaje" value={porcentaje} onChange={e => setPorcentaje(Number(e.target.value))} required /><br/><br/>

        <h3>Vincular a Categoría General (GENERICOSXDESCUENTOS)</h3>
        <select value={linkedProductId} onChange={e => setLinkedProductId(Number(e.target.value))}>
          <option value={0}>Aplicar a Toda la Tienda (Ninguno)</option>
          {availableProducts.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <br/><br/>
        <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>Guardar Campaña</button>
      </form>
    </div>
  );
};
export default DiscountFormScreen;