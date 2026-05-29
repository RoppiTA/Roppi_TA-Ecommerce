import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import DetalleProducto from '../../views/comerciante/DetalleProducto';
import DefaultComerciante from '../../views/comerciante/DefaultComerciante';

export const ComercianteStack = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Inyectamos el nuevo Sidebar con el comportamiento limpio */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Contenedor principal de pantallas */}
      <main style={{ flex: 1, padding: '40px', background: '#f8fafc' }}>
        <Routes>
                {/* 🔴 ASEGÚRATE DE QUE EL PATH SEA "/*" */}
                <Route path="*" element={<DefaultComerciante/>}/>
                <Route path="products/new" element={<DetalleProducto/>}/>
                <Route path="products/view/*" element={<DetalleProducto/>}/>
                <Route path="products/edit" element={<DetalleProducto/>}/>

                 {/* Rutas comodín temporales por si hacen clic en módulos no desarrollados aún */}
                <Route path="/orders" element={<div>📦 Pantalla de Pedidos (Próximamente)</div>} />
                <Route path="/clientes" element={<div>👥 Pantalla de Clientes (Próximamente)</div>} />
                <Route path="/reports" element={<div>📈 Pantalla de Reportes (Próximamente)</div>} />
                <Route path="/quotes" element={<div>📈 Pantalla de Cotizaciones (Próximamente)</div>} />
                <Route path="/" element={<Navigate to="*" replace />} />
        </Routes>
      </main>
    </div>
  );
};
export default ComercianteStack;