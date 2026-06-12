import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import DetalleProducto from '../../views/comerciante/DetalleProducto';
import DefaultComerciante from '../../views/comerciante/DefaultComerciante';
import ProductListPage from '../../views/comerciante/ProductListPage';
import DiscountsPage from '../../views/comerciante/DiscountsPage';
import { Header } from '../../components/Header';

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
        role="COMERCIANTE"
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior compartida por todas las vistas del comerciante */}
        <Header />

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