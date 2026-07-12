import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const apiClient = axios.create({
  // Use env variable if provided (e.g. VITE_API_URL), otherwise default to the local backend
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout — avoids requests hanging if BE is offline
});

// REQUEST: Attach JWT from store
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Globally unwrap backend responses that use the { status, message, data } format
    if (
      response.data &&
      typeof response.data === 'object' &&
      (response.data.status === true || response.data.status === 200 || response.data.status === 201) &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and redirect to login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      // Network error or timeout (backend is offline)
      console.warn('Backend unreachable:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
