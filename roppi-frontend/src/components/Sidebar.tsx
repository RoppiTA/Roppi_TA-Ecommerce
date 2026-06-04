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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [catalogExpanded, setCatalogExpanded] = useState(true);

  const catalogChildren = [
    { id: 'vista-general', label: 'Vista general', path: '/' },
    { id: 'productos', label: 'Productos', path: '/products' },
    { id: 'descuentos', label: 'Descuentos', path: '/descuentos' },
    { id: 'categorias', label: 'Categorías', path: '/categorias' },
  ];

  const topItems = [
    { id: 'orders', label: 'Ordenes', icon: ShoppingCart, path: '/orders' },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText, path: '/quotes' },
    { id: 'clients', label: 'Clientes', icon: Users, path: '/clientes' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/reports' },
  ];

  const bottomItems = [
    { id: 'support', label: 'Support', icon: HelpCircle, path: '/support' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={`h-full bg-white border-r border-border flex flex-col transition-all duration-300 flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-2xl tracking-tight text-slate-950">Roppi</h2>
            <p className="text-sm font-medium text-muted-foreground">Gestión de Negocios</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1.5">
          {/* Catálogo — solo despliega/pliega subopciones */}
          <div>
            <button
              onClick={() => !isCollapsed && setCatalogExpanded(!catalogExpanded)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors font-medium"
              title={isCollapsed ? 'Catálogo' : undefined}
            >
              <Boxes size={22} />
              {!isCollapsed && (
                <>
                  <span className="text-base flex-1 text-left">Catálogo</span>
                  {catalogExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </>
              )}
            </button>

            {!isCollapsed && catalogExpanded && (
              <div className="ml-8 mt-1 space-y-1">
                {catalogChildren.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-accent text-foreground font-medium'
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Resto de ítems */}
          {topItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-accent text-foreground font-medium'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={22} />
                {!isCollapsed && <span className="text-base">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Ítems inferiores */}
      <div className="p-3 border-t border-border space-y-1.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-accent text-foreground font-medium'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={22} />
              {!isCollapsed && <span className="text-base">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
