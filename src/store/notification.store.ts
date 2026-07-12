import { create } from 'zustand';
import { Notification } from '@/types';
import { NotificationService } from '@/services/notification.service';
import { useAuthStore } from './auth.store';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchTotalCount: () => Promise<void>;
  markAsRead: (id: number | string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  loading: false,

  fetchNotifications: async () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user?.role) return;
    
    set({ loading: true });
    try {
      const data = await NotificationService.getByRole(user.role);
      set({ notifications: data });
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user?.role) return;
    
    try {
      const count = await NotificationService.getUnreadCount(user.role);
      set({ unreadCount: count });
    } catch (err) {
      console.error('Failed to load unread count', err);
    }
  },

  fetchTotalCount: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    try {
      const count = await NotificationService.getCount();
      set({ totalCount: count });
    } catch (err) {
      console.error('Failed to load total count', err);
    }
  },

  markAsRead: async (id: number | string) => {
    try {
      await NotificationService.markAsRead(id);
      
      // Update local state immediately
      set((state) => {
        const updatedNotifications = state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updatedNotifications,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
      
      // Optional: re-fetch to ensure sync with server
      // get().fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  },
}));
