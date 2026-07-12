import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Role } from '@/types';

const MOCK_ROLES: Role[] = [
  {
    id: 1,
    name: 'ADMIN',
    permissions: ['All'],
    modules: ['Dashboard', 'Products', 'Suppliers', 'Reorders', 'Locations', 'Batches', 'Inventory', 'QR Codes', 'Alerts', 'User Management']
  },
  {
    id: 2,
    name: 'MANAGER',
    permissions: ['Product CRUD', 'Supplier CRUD'],
    modules: ['Products', 'Suppliers', 'User Management']
  },
  {
    id: 3,
    name: 'STAFF',
    permissions: ['Product Read', 'Batch Read'],
    modules: ['Products', 'Batches']
  }
];

export const RoleService = {
  getRoles: async (): Promise<Role[]> => {
    try {
      const { data } = await apiClient.get(API.ROLES.BASE);
      return data && data.length > 0 ? data : MOCK_ROLES;
    } catch {
      return MOCK_ROLES;
    }
  },

  createRole: async (role: Partial<Role>): Promise<Role> => {
    try {
      const { data } = await apiClient.post(API.ROLES.BASE, role);
      return data;
    } catch {
      const newRole = { ...role, id: Math.floor(Math.random() * 1000) } as Role;
      MOCK_ROLES.push(newRole);
      return newRole;
    }
  },

  updateRole: async (id: string | number, role: Partial<Role>): Promise<Role> => {
    try {
      const { data } = await apiClient.put(API.ROLES.BY_ID(id), role);
      return data;
    } catch {
      const index = MOCK_ROLES.findIndex(r => r.id === id);
      if (index !== -1) {
        MOCK_ROLES[index] = { ...MOCK_ROLES[index], ...role };
        return MOCK_ROLES[index];
      }
      throw new Error('Role not found');
    }
  }
};
