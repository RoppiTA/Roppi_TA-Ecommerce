import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import DetalleProducto from '../../views/cliente/DetalleProducto';
import DefaultCliente from '../../views/cliente/DefaultCliente';
import ProductListPage from '../../views/cliente/ProductListPage';

export const ClienteStack = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        role="CLIENT"
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior compartida por todas las vistas del cliente */}
        <header className="bg-brand-light/40 border-b border-primary-hover/15 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 hover:bg-primary2/10 rounded-lg relative transition-colors">
              <Bell size={20} className="text-brand-dark" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full" />
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-primary-hover text-white rounded-full flex items-center justify-center text-sm font-medium">
                C
              </div>
              <span className="text-sm font-medium hidden sm:block text-brand-dark">Cliente</span>
            </div>
          </div>
        </header>

        {/* Área de contenido de cada vista */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="*" element={<DefaultCliente />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<DetalleProducto />} />
            <Route path="products/view/*" element={<DetalleProducto />} />
            <Route path="products/edit" element={<DetalleProducto />} />
            <Route path="orders" element={<div className="p-10 text-brand-muted">📦 Pantalla de Pedidos (Próximamente)</div>} />
            <Route path="quotes" element={<div className="p-10 text-brand-muted">📝 Pantalla de Cotizaciones (Próximamente)</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};
export default ClienteStack;