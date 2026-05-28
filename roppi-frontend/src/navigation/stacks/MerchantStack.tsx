/*ESTO ES UN ARCHIVO DUMMY PARA PRUEBA DE FLUJOS
 Se esta dejando como modelo para implementación de versión final
 Con pantalla de figma make */

import { Routes, Route, Navigate } from 'react-router-dom';
import ProductsScreen from '../../views/comerciante/ProductsScreen';
import ProductFormScreen from '../../views/comerciante/ProductFormScreen';
import DiscountsScreen from '../../views/comerciante/DiscountsScreen';
import DiscountFormScreen from '../../views/comerciante/DiscountFormScreen';

interface StackProps { userId: number; }

export const MerchantStack = ({ userId }: StackProps) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Tu menú lateral */}
      <aside style={{ width: '240px', background: '#0f172a', color: 'white', padding: '20px' }}>
        <h3>👔 Roppi TA</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Operario: {userId}</p>
        <hr />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {/* 🔴 Verifica que los enlaces apunten correctamente */}
          <a href="/products" style={{ color: 'white', textDecoration: 'none' }}>📦 Gestión Genéricos</a>
          <a href="/discounts" style={{ color: 'white', textDecoration: 'none' }}>🏷️ Descuentos</a>
        </nav>
      </aside>

      {/* Contenedor principal de pantallas */}
      <main style={{ flex: 1, padding: '40px', background: '#f8fafc' }}>
        <Routes>
          {/* 🔴 RUTAS EXACTAS: Revisa que no tengan barras inclinadas de más */}
          <Route path="/products" element={<ProductsScreen />} />
          <Route path="/products/new" element={<ProductFormScreen />} />
          <Route path="/products/edit/:id" element={<ProductFormScreen />} />
          
          <Route path="/discounts" element={<DiscountsScreen />} />
          <Route path="/discounts/new" element={<DiscountFormScreen />} />
          <Route path="discounts/edit/:id" element={<DiscountFormScreen />} />

          {/* Ruta por defecto si entran a una URL que no existe */}
          <Route path="/" element={<Navigate to="/products" replace />} />
          
          {/* Si dejas esta línea para probar, solo debería activarse si pones una URL rota en el navegador */}
          <Route path="*" element={<div>Ruta no encontrada o cargando...</div>} />
        </Routes>
      </main>
    </div>
  );
};
export default MerchantStack;