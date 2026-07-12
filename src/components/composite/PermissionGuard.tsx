import React, { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/roles.constants';

export const PermissionGuard = ({ permission, fallback = null, children }: { permission: keyof typeof PERMISSIONS, fallback?: ReactNode, children: ReactNode }) => {
  const hasPermission = usePermission(permission);
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  return fallback;
};
