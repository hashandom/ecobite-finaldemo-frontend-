import React, { useState, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageWrapper } from './PageWrapper';
import { useAlertsWebSocket } from '@/hooks/useAlertsWebSocket';

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mount global WebSocket listener for real-time stock alerts
  useAlertsWebSocket();

  return (
    <div className="flex h-screen bg-surface overflow-hidden text-text font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto">
          {/* We wrap children or the outlet in a PageWrapper so there's always padding by default */}
          <PageWrapper>
            {children || <Outlet />}
          </PageWrapper>
        </main>
      </div>
    </div>
  );
};
