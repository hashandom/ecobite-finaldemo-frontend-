import { PERMISSIONS } from '@/constants/roles.constants';
import { useAuthStore } from '@/store/auth.store';

export const usePermission = (permissionKey: keyof typeof PERMISSIONS) => {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !PERMISSIONS[permissionKey]) return false;
  return PERMISSIONS[permissionKey].includes(role);
};
