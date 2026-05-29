import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Boxes
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  
  // 1. Catálogo ahora es un botón directo que apunta a /products
  const menuItems = [
    { id: 'catalog', label: 'Catálogo', icon: Boxes, path: '/products' }, 
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
      // 🟢 min-h-screen asegura que cubra TODO el largo vertical de la página
      className={`min-h-screen bg-white border-r border-border flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            {/* 🟢 Título principal más grande (text-2xl) */}
            <h2 className="font-bold text-2xl tracking-tight text-slate-950">Roppi</h2>
            {/* 🟢 Subtítulo más grande (text-sm) */}
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

      {/* Menu Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
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
                {/* 🟢 Íconos ligeramente más grandes (size 22) para equilibrar el texto */}
                <Icon size={22} />
                {/* 🟢 Textos de opciones más grandes (text-base) */}
                {!isCollapsed && <span className="text-base">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Items */}
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