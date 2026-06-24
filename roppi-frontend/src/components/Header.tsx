// src/components/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, LogIn, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta a tu AuthContext

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener la inicial del nombre dinámicamente
  const displayInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'I';
  const displayName = user?.name || 'Invitado';
  const isGuest = user?.role?.includes('GUEST');

  // erificar si el rol incluye 'CLIENTE' para colocar opcion de carrito de compras
  const isCliente = user?.role?.includes('CLIENTE');

  // Cerrar el menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = () => {
    setDropdownOpen(false);
    if (isGuest) {
      // Si es invitado, lo mandamos a iniciar sesión
      navigate('/auth');
    } else {
      // Si está conectado, cerramos sesión y mandamos a la raíz pública
      logout(); // Esto limpia el token y setea el rol a 'GUEST'
      navigate('/');
    }
  };

  return (
    <header className="bg-brand-light/40 border-b border-primary-hover/15 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Botón de Notificaciones */}
        <button className="p-2 hover:bg-primary2/10 rounded-lg relative transition-colors cursor-pointer">
          <Bell size={20} className="text-brand-dark" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full" />
        </button>

        {/* Contenedor del Usuario con Menú Desplegable */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 ml-2 hover:bg-primary2/5 p-1.5 rounded-xl transition-colors cursor-pointer outline-none"
          >
            <div className="w-8 h-8 bg-primary-hover text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
              {displayInitial}
            </div>
            <span className="text-sm font-medium hidden sm:block text-brand-dark">
              {displayName}
            </span>
          </button>

          {/* Menú Desplegable (Dropdown) */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-xs text-brand-muted font-medium">Conectado como</p>
                <p className="text-sm font-bold text-brand-dark truncate">{displayName}</p>
                <p className="text-[10px] bg-primary2/10 text-primary-hover inline-block px-2 py-0.5 rounded-full font-semibold mt-1">
                  Rol: {user?.role?.join(', ')}
                </p>
              </div>

              <button
                onClick={handleAction}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer text-left ${
                  isGuest 
                    ? 'text-primary-hover hover:bg-primary2/10' 
                    : 'text-brand-error hover:bg-red-50'
                }`}
              >
                {isGuest ? (
                  <>
                    <LogIn size={18} />
                    <span>Iniciar sesión</span>
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Carrito de Compras (Solo visible para CLIENTE) */}
        {isCliente && (
          <button 
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-primary2/10 rounded-lg relative transition-colors cursor-pointer"
            title="Ver mi carrito"
          >
            <ShoppingCart size={20} className="text-brand-dark" />
          </button>
        )}
      </div>
    </header>
);
};