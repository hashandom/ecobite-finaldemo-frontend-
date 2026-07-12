import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  BellRing,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Truck,
  MapPin,
  ShoppingCart,
  QrCode,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { APP_CONFIG } from '@/constants/app.constants';
import { Tooltip, Avatar } from '@/components/ui';
import { ReorderService } from '@/services/reorder.service';

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { user, logout, isModuleVisible } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [pendingReorders, setPendingReorders] = React.useState(0);
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    'User Management': true // default expanded for demo visibility
  });

  React.useEffect(() => {
    ReorderService.getPendingCount().then(setPendingReorders).catch(() => { });
  }, []);

  interface NavItem {
    name: string;
    path?: string;
    icon: React.ReactNode;
    badge?: number;
    children?: { name: string; path: string }[];
  }

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
    // { name: 'Reorders', path: '/reorders', icon: <ShoppingCart size={20} />, badge: pendingReorders },
    { name: 'Locations', path: '/locations', icon: <MapPin size={20} /> },
    { name: 'Batches', path: '/batches', icon: <Layers size={20} /> },
    { name: 'QR Codes', path: '/qrcodes', icon: <QrCode size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <BellRing size={20} />, badge: unreadCount },
    { name: 'User Management', path: '/users/staff', icon: <Users size={20} /> }
  ];

  // Filter top-level items based on visibility
  const visibleNavItems = navItems.filter(item => isModuleVisible(item.name));

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const renderNavLink = (item: any, isSubLink = false) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative
        ${isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted hover:bg-surface hover:text-text'
        }
        ${isCollapsed ? 'justify-center' : ''}
        ${isSubLink ? 'pl-9 text-sm py-2' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !isSubLink && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md shadow-[0_0_8px_var(--color-primary)]" />
          )}
          {isActive && isSubLink && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary/70 rounded-r-sm" />
          )}
          <div className="flex-shrink-0 relative">
            {item.icon}
            {item.badge > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white
                ${isCollapsed ? 'border-2 border-card' : ''}`}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="ml-3 whitespace-nowrap flex-1">{item.name}</span>
          )}
          {!isCollapsed && item.badge > 0 && (
            <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full ml-auto">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className={`glass-sidebar relative flex flex-col h-screen border-r border-border transition-all duration-300 z-10 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-card border border-border text-muted hover:text-primary rounded-full p-1 z-20 shadow-sm focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo Area */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <Leaf size={24} />
        </div>
        {!isCollapsed && (
          <span className="ml-3 font-bold text-lg text-text whitespace-nowrap overflow-hidden">
            EcoBite
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {visibleNavItems.map((item) => {
          if (item.children) {
            const isExpanded = !!expandedMenus[item.name];
            return (
              <div key={item.name} className="flex flex-col gap-0.5">
                {isCollapsed ? (
                  <Tooltip content={item.name} position="right">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-muted hover:bg-surface hover:text-text transition-all duration-200"
                    >
                      {item.icon}
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-muted hover:bg-surface hover:text-text transition-all duration-200 w-full text-left"
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <span className="ml-3 whitespace-nowrap flex-1">{item.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
                {!isCollapsed && isExpanded && (
                  <div className="flex flex-col gap-0.5 mt-0.5 border-l border-border/60 ml-4 pl-1">
                    {item.children.map((child: any) => (
                      <div key={child.path}>
                        {renderNavLink(child, true)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.path}>
              {isCollapsed ? (
                <Tooltip content={item.name} position="right">
                  {renderNavLink(item)}
                </Tooltip>
              ) : (
                renderNavLink(item)
              )}
            </div>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-border">
        {isCollapsed ? (
          <Tooltip content="Logout" position="right">
            <button onClick={() => logout()} className="w-full flex justify-center hover:opacity-80 transition-opacity">
              <Avatar initials={user?.username?.charAt(0)?.toUpperCase() || 'U'} size="sm" />
            </button>
          </Tooltip>
        ) : (
          <div className="flex items-center p-2 -mx-2 rounded-lg transition-colors">
            <Avatar initials={user?.username?.charAt(0)?.toUpperCase() || 'U'} size="md" />
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-text truncate">{user?.username || 'Guest User'}</p>
              <p className="text-xs text-muted truncate">{user?.role || 'VIEWER'}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); logout(); }} className="text-muted hover:text-danger p-1" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
