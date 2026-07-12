import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

interface RequireModuleProps {
  moduleName: string;
  children: React.ReactNode;
}

export const RequireModule = ({ moduleName, children }: RequireModuleProps) => {
  const { isModuleVisible } = useAuth();

  if (!isModuleVisible(moduleName)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Access Denied</h2>
        <p className="text-muted max-w-md text-center">
          You don't have the necessary permissions to view the <strong>{moduleName}</strong> module. 
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
