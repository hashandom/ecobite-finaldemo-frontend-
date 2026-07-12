import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Notification } from '@/types';

export const NotificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get(API.NOTIFICATIONS.BASE);
    return data;
  },
  getCount: async (): Promise<number> => {
    const { data } = await apiClient.get(API.NOTIFICATIONS.COUNT);
    return data;
  },
  getByRole: async (role: string): Promise<Notification[]> => {
    const { data } = await apiClient.get(API.NOTIFICATIONS.BY_ROLE(role));
    return data;
  },
  getUnreadCount: async (role: string): Promise<number> => {
    const { data } = await apiClient.get(API.NOTIFICATIONS.UNREAD_COUNT(role));
    return data;
  },
  getTotalCount: async (role: string): Promise<number> => {
    const { data } = await apiClient.get(API.NOTIFICATIONS.ROLE_COUNT(role));
    return data;
  },
  markAsRead: async (id: string | number): Promise<string> => {
    const { data } = await apiClient.put(API.NOTIFICATIONS.MARK_AS_READ(id));
    return data;
  }
};
