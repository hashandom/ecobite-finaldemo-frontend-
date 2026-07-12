import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  role: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setFirstLogin: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setFirstLogin: (status) => set((state) => ({
        user: state.user ? { ...state.user, firstLogin: status } : null
      })),
    }),
    {
      name: 'ecobite-auth',
    }
  )
);
