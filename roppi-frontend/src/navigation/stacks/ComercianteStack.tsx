import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import DetalleProducto from '../../views/comerciante/DetalleProducto';
import DefaultComerciante from '../../views/comerciante/DefaultComerciante';
import ProductListPage from '../../views/comerciante/ProductListPage';
import DiscountsPage from '../../views/comerciante/DiscountsPage';

//Prop para tener los datos del usuario logueado, como su id y rol, para mostrar información personalizada en el sidebar y otras partes de la interfaz del comerciante
interface ComercianteStackProps {
  user: {
    id: number;
    role: string;
    name?: string;
  };
}

export const ComercianteStack = ({ user }: ComercianteStackProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  //Hacemos la extracción de la primera letra del nombre del usuario para mostrarla en el avatar del header
  const displayName = user.name ? user.name : 'Roppi Comerciante';
  const displayInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'RC';
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        role="MERCHANT"
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior compartida por todas las vistas del comerciante */}
        <header className="bg-brand-light/40 border-b border-primary-hover/15 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 hover:bg-primary2/10 rounded-lg relative transition-colors">
              <Bell size={20} className="text-brand-dark" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full" />
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-primary-hover text-white rounded-full flex items-center justify-center text-sm font-medium">
                {displayInitial}
              </div>
              <span className="text-sm font-medium hidden sm:block text-brand-dark">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Área de contenido de cada vista */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="descuentos" element={<DiscountsPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<DetalleProducto />} />
            <Route path="products/view/*" element={<DetalleProducto />} />
            <Route path="products/edit" element={<DetalleProducto />} />
            <Route path="orders" element={<div className="p-10 text-brand-muted">📦 Pantalla de Pedidos (Próximamente)</div>} />
            <Route path="reports" element={<div className="p-10 text-brand-muted">📈 Pantalla de Reportes (Próximamente)</div>} />
            <Route path="quotes" element={<div className="p-10 text-brand-muted">📝 Pantalla de Cotizaciones (Próximamente)</div>} />
            <Route path="support" element={<div className="p-10 text-brand-muted">❓ Pantalla de Soporte (Próximamente)</div>} />
            <Route path="settings" element={<div className="p-10 text-brand-muted">⚙️ Pantalla de Configuración (Próximamente)</div>} />
            <Route path="*" element={<DefaultComerciante />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};
export default ComercianteStack;