import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notification.store';
import { useAuthStore } from '@/store/auth.store';

// Global flag to ensure we only have one polling interval running
let isPolling = false;

export const useNotifications = () => {
  const store = useNotificationStore();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (!token || !role) {
      useNotificationStore.setState({ notifications: [], unreadCount: 0 });
      return;
    }
    
    if (!isPolling) {
      isPolling = true;
      store.fetchUnreadCount();
      store.fetchTotalCount();
      const interval = setInterval(() => {
        useNotificationStore.getState().fetchUnreadCount();
        useNotificationStore.getState().fetchTotalCount();
      }, 60000);
      
      return () => {
        clearInterval(interval);
        isPolling = false;
      };
    }
  }, [token, role]);

  return store;
};
