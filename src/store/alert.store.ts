import { create } from 'zustand';
import { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markAllRead: () => void;
  resolveAlert: (id: string) => void;
  clearResolved: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + 1,
  })),
  markAllRead: () => set({ unreadCount: 0 }),
  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, resolved: true } : a)
  })),
  clearResolved: () => set((state) => ({
    alerts: state.alerts.filter(a => !a.resolved)
  })),
}));
