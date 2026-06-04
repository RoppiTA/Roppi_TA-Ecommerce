import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import DetalleProducto from '../../views/comerciante/DetalleProducto';
import DefaultComerciante from '../../views/comerciante/DefaultComerciante';
import ProductListPage from '../../views/comerciante/ProductListPage';

export const ComercianteStack = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Contenedor principal de pantallas */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Routes>
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<DetalleProducto/>}/>
                <Route path="products/view/*" element={<DetalleProducto/>}/>
                <Route path="products/edit" element={<DetalleProducto/>}/>
                <Route path="descuentos" element={<div style={{padding:'40px'}}>💸 Pantalla de Descuentos (Próximamente)</div>} />
                <Route path="orders" element={<div style={{padding:'40px'}}>📦 Pantalla de Pedidos (Próximamente)</div>} />
                <Route path="clientes" element={<div style={{padding:'40px'}}>👥 Pantalla de Clientes (Próximamente)</div>} />
                <Route path="reports" element={<div style={{padding:'40px'}}>📈 Pantalla de Reportes (Próximamente)</div>} />
                <Route path="quotes" element={<div style={{padding:'40px'}}>📈 Pantalla de Cotizaciones (Próximamente)</div>} />
                <Route path="*" element={<DefaultComerciante/>}/>
        </Routes>
      </main>
    </div>
  );
};
export default ComercianteStack;