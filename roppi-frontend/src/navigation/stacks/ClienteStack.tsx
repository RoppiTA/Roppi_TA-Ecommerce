import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { CarritoProvider } from '../../context/CarritoContext';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import DetalleProducto from '../../views/cliente/DetalleProducto';
import DefaultCliente from '../../views/cliente/DefaultCliente';
import ProductListPage from '../../views/cliente/ProductListPage';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Customization from '../../views/cliente/Customization';
import ProductCart from '../../views/cliente/ProductCart';
import CompraSegura from '../../views/cliente/CompraSegura';
import { CotizacionListScreen } from '../../views/cliente/cotizacion/CotizacionList';
import { CotizacionDetailScreen } from '../../views/cliente/cotizacion/DetalleCotizacion';
import { SolicitudCotizacionScreen } from '../../views/cliente/SolicitudCotizacion';


interface ClienteStackProps {
  user: {
    id: number;
    role: string;
    name?: string; // Opcional, ya que un GUEST podría no tener nombre
  };
}

export const ClienteStack = ({ user }: ClienteStackProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAuthenticated = user.role.includes('CLIENTE');

  // Si está autenticado y tiene nombre, usamos su nombre. Si no, mostramos "Invitado".
  const displayName = isAuthenticated && user.name ? user.name : 'Invitado';

  // Obtenemos la inicial del primer nombre. Si es invitado, mostramos una "I".
  const displayInitial = isAuthenticated && user.name 
    ? user.name.trim().charAt(0).toUpperCase() 
    : 'I';

  return (
    <CarritoProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        role="CLIENTE"
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior compartida por todas las vistas del cliente */}
        <Header />

        {/* Área de contenido de cada vista */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            {/* === RUTAS PÚBLICAS (Acceso libre) === */}
            <Route path="*" element={<DefaultCliente />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/view/*" element={<DetalleProducto />} />

            {/* === RUTAS PRIVADAS (Protegidas) === */}
            <Route 
              path="orders" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <div className="p-10 text-brand-muted">📦 Pantalla de Pedidos (Próximamente)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="quotes" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <CotizacionListScreen />
                </ProtectedRoute>
              } 
            />
            <Route
              path="personalization"
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <Customization />
                </ProtectedRoute>
              }
            />
            <Route
              path="cart"
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <ProductCart />
                </ProtectedRoute>
              }
            />
            <Route
              path="quotes/view"
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <CotizacionDetailScreen />
                </ProtectedRoute>
              }
            />
            <Route 
              path="quotes/new" 
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <SolicitudCotizacionScreen />
                </ProtectedRoute>
              } 
            />

            //Rutas adicionales para soporte y configuración (Próximamente)
            <Route path="support" element={<div className="p-10 text-brand-muted">❓ Pantalla de Soporte (Próximamente)</div>} />
            <Route path="settings" element={<div className="p-10 text-brand-muted">⚙️ Pantalla de Configuración (Próximamente)</div>} />
            <Route
              path="compra-segura"
              element={
                <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/auth">
                  <CompraSegura />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
    </CarritoProvider>
  );
};
export default ClienteStack;