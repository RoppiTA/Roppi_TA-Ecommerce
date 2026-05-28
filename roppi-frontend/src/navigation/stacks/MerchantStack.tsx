/*ESTO ES UN ARCHIVO DUMMY PARA PRUEBA DE FLUJOS
 Se esta dejando como modelo para implementación de versión final
 Con pantalla de figma make */
import { Routes, Route } from 'react-router-dom';
import ProductsScreen from '../../views/merchant/ProductsScreen';
import ProductFormScreen from '../../views/merchant/ProductFormScreen';
import DiscountsScreen from '../../views/merchant/DiscountsScreen';
import DiscountFormScreen from '../../views/merchant/DiscountFormScreen';

export const MerchantStack = () => {
  return ( 
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Un Layout común de navegación lateral para el comerciante */}
      <nav style={{ width: '250px', background: '#1e293b', color: 'white', padding: '20px' }}>
        <h3>Roppi TA - Merchant</h3>
        <hr />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '15px 0' }}><a href="/products" style={{ color: 'white' }}>👕 Productos</a></li>
          <li style={{ margin: '15px 0' }}><a href="/discounts" style={{ color: 'white' }}>🏷️ Descuentos</a></li>
        </ul>
      </nav>

      {/* Contenedor dinámico del flujo */}
      <main style={{ flex: 1, padding: '30px', background: '#f8fafc' }}>
        <Routes>
          {/* Rutas de Gestión de Productos */}
          <Route path="/products" element={<ProductsScreen />} />
          <Route path="/products/new" element={<ProductFormScreen />} />
          <Route path="/products/edit/:id" element={<ProductFormScreen />} />

          {/* Rutas de Gestión de Descuentos */}
          <Route path="/discounts" element={<DiscountsScreen />} />
          <Route path="/discounts/new" element={<DiscountFormScreen />} />
          <Route path="/discounts/edit/:id" element={<DiscountFormScreen />} />
        </Routes>
      </main>
    </div>
  );
};

export default MerchantStack;