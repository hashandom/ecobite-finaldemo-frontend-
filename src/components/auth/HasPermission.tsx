import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface HasPermissionProps {
  permission?: string;
  module?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const HasPermission = ({ permission, module, fallback = null, children }: HasPermissionProps) => {
  const { hasPermission, isModuleVisible } = useAuth();

  if (module && !isModuleVisible(module)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
