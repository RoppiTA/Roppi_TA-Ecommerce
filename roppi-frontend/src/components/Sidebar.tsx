import {
  Users,
  ShoppingCart,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Boxes,
  Shirt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  role: 'COMERCIANTE' | 'CLIENTE';
}

export function Sidebar({ isCollapsed, onToggle, role }: SidebarProps) {
  if (role === 'COMERCIANTE') {
    return merchant_sidebar(isCollapsed, onToggle);
  }
  else if (role === 'CLIENTE') {
    return client_sidebar(isCollapsed, onToggle);
  }
  else return default_sidebar(isCollapsed, onToggle);
}

function merchant_sidebar(isCollapsed: boolean, onToggle: () => void) {
  const [catalogExpanded, setCatalogExpanded] = useState(true);

  const catalogChildren = [
    { id: 'vista-general', label: 'Vista general', path: '/comerciante' },
    { id: 'productos', label: 'Productos', path: '/comerciante/products' },
    { id: 'descuentos', label: 'Descuentos', path: '/comerciante/descuentos' },
  ];

  const topItems = [
    { id: 'orders', label: 'Ordenes', icon: ShoppingCart, path: '/comerciante/orders' },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText, path: '/comerciante/quotes' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/comerciante/reports' },
  ];

  const bottomItems = [
    { id: 'support', label: 'Soporte', icon: HelpCircle, path: '/comerciante/support' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/comerciante/settings' },
  ];

  // Clases comunes reutilizables
  const itemBase = 'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150';
  const itemInactive = 'text-brand-dark hover:bg-primary-hover/10';
  const itemActive = 'bg-primary2 text-white';

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 flex-shrink-0 bg-brand-light ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-2xl tracking-tight text-primary-hover">Roppi</h2>
            <p className="text-xs font-medium text-brand-muted mt-0.5">Gestión de Negocios</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-primary-hover/10 transition-colors text-brand-dark"
        >
          {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 p-3 overflow-y-auto mt-2">
        <div className="space-y-1">

          {/* Catálogo (grupo expandible) */}
          <div>
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-3 mb-1.5">
                Catálogo
              </p>
            )}
            <button
              onClick={() => !isCollapsed && setCatalogExpanded(!catalogExpanded)}
              className={`${itemBase} ${itemInactive}`}
              title={isCollapsed ? 'Catálogo' : undefined}
            >
              <Boxes size={20} className="text-primary2 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="text-sm flex-1 text-left font-medium">Catálogo</span>
                  {catalogExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </>
              )}
            </button>

            {!isCollapsed && catalogExpanded && (
              <div className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-primary-hover/20 pl-3">
                {catalogChildren.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    end={child.path === '/comerciante'}
                    className={({ isActive }) =>
                      `relative flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-150 font-medium ${isActive
                        ? 'bg-primary2 text-white'
                        : 'text-brand-dark hover:bg-primary-hover/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand-error rounded-r-full" />
                        )}
                        <span className="pl-1">{child.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Separador visual */}
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-3 pt-3 pb-1">
              Operaciones
            </p>
          )}

          {/* Ítems principales */}
          {topItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-error rounded-r-full" />
                    )}
                    <Icon
                      size={20}
                      className={`shrink-0 ${isActive ? 'text-white' : 'text-primary2'}`}
                    />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Ítems inferiores ── */}
      <div className="p-3 border-t border-primary-hover/20 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-error rounded-r-full" />
                  )}
                  <Icon
                    size={20}
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-primary2'}`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

function client_sidebar(isCollapsed: boolean, onToggle: () => void) {
  const [catalogExpanded, setCatalogExpanded] = useState(true);

  const topItems = [
    { id: 'productos', label: 'Productos', icon: Shirt, path: '/products' },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText, path: '/quotes' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, path: '/orders' },
    
  ];

  const bottomItems = [
    { id: 'support', label: 'Soporte', icon: HelpCircle, path: '/support' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' },
  ];

  // Clases comunes reutilizables
  const itemBase = 'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150';
  const itemInactive = 'text-brand-dark hover:bg-primary-hover/10';
  const itemActive = 'bg-primary2 text-white';

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 flex-shrink-0 bg-brand-light ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-2xl tracking-tight text-primary-hover">Roppi</h2>
            <p className="text-xs font-medium text-brand-muted mt-0.5">Barra de Navegación</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-primary-hover/10 transition-colors text-brand-dark"
        >
          {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 p-3 overflow-y-auto mt-2">
        <div className="space-y-1">
          {/* Separador visual */}
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted px-3 pt-3 pb-1">
              Operaciones
            </p>
          )}

          {/* Ítems principales */}
          {topItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-error rounded-r-full" />
                    )}
                    <Icon
                      size={20}
                      className={`shrink-0 ${isActive ? 'text-white' : 'text-primary2'}`}
                    />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Ítems inferiores ── */}
      <div className="p-3 border-t border-primary-hover/20 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-error rounded-r-full" />
                  )}
                  <Icon
                    size={20}
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-primary2'}`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

function default_sidebar(isCollapsed: boolean, onToggle: () => void) {
  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 flex-shrink-0 bg-brand-light ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-2xl tracking-tight text-primary-hover">Roppi</h2>
            <p className="text-xs font-medium text-brand-muted mt-0.5">Gestión de Negocios</p>
          </div>
        )}
        <button

          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-primary-hover/10 transition-colors text-brand-dark"
        >
          {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>
      <div className="p-3 border-t border-primary-hover/20 space-y-1">
      {!isCollapsed && (
        <p className="text-sm font-medium text-brand-muted">
          Error: Rol no reconocido.
        </p>
      )}
      </div>
    </aside>
  );
}