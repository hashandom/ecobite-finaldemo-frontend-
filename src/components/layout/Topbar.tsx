import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, ChevronRight, User, Settings, LogOut, Command } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Map pathnames to readable breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Dashboard'];
    return paths.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm">
          <span className="text-muted hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              <ChevronRight size={14} className="mx-1 text-border" />
              <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-text' : 'text-muted'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Global Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <button className="flex items-center gap-2 w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-muted hover:border-primary/50 hover:bg-card transition-all">
            <Search size={16} />
            <span className="text-sm flex-1 text-left">Search anything...</span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-border text-xs font-medium shadow-sm">
              <Command size={12} /> K
            </div>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 text-muted hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-surface"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-danger text-[11px] font-bold text-white border-2 border-card shadow-sm animate-fade-in">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        {user && (
          <div className="relative pl-2 sm:pl-4 border-l border-border">
            <button 
              className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-light text-white text-sm font-bold flex items-center justify-center shadow-md">
                {(user.username || user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-text leading-tight">
                  {user.username || user.name || 'User'}
                </span>
                <span className="text-[10px] text-muted leading-tight uppercase tracking-wider">{user.role || 'Admin'}</span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in origin-top-right">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text">{user.username || 'User'}</p>
                  <p className="text-xs text-muted truncate">{user.email || 'admin@ecobytes.com'}</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface transition-colors">
                  <User size={16} className="text-muted" /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface transition-colors">
                  <Settings size={16} className="text-muted" /> Settings
                </button>
                <div className="h-px bg-border my-1" />
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
