import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { User } from '@/types';

export const UserService = {
  getStaff: async (): Promise<User[]> => {
    const { data } = await apiClient.get(API.USERS.STAFF);
    const list = data && data.data !== undefined ? data.data : data;
    return list || [];
  },

  getUserById: async (id: string | number): Promise<User> => {
    const { data } = await apiClient.get(API.USERS.BY_ID(id));
    const user = data && data.data !== undefined ? data.data : data;
    return user;
  },

  createStaff: async (user: Partial<User>): Promise<User> => {
    const { data } = await apiClient.post(API.AUTH.REGISTER, user);
    if (data && data.status === false) {
      throw new Error(data.message || 'Failed to add staff member');
    }
    const newUser = data && data.data !== undefined ? data.data : data;
    return newUser;
  },

  updateUser: async (id: string | number, user: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put(API.USERS.BY_ID(id), user);
    if (data && data.status === false) {
      throw new Error(data.message || 'Failed to update user');
    }
    return { id, ...user } as User;
  },

  deleteUser: async (id: string | number): Promise<void> => {
    const { data } = await apiClient.delete(API.USERS.BY_ID(id));
    if (data && data.status === false) {
      throw new Error(data.message || 'Failed to delete user');
    }
  }
};
