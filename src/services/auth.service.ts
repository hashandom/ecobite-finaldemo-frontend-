import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { parseJwtFromHeader, decodeJwt } from '@/utils/jwt.utils';

export const AuthService = {
  /**
   * Login with username + password
   * Expects JWT in the 'Authorization' response header
   */
  login: async ({ username, password }: any) => {
    const response = await apiClient.post(API.AUTH.LOGIN, { username, password });

    if (response.data && response.data.status === false) {
      throw new Error(response.data.message || 'Login failed');
    }

    let token = null;
    let user = null;

    if (response.data && response.data.data && response.data.data.token) {
      token = response.data.data.token;
      user = response.data.data;
    } else if (response.data && response.data.token) {
      token = response.data.token;
      user = response.data;
    } else {
      // Fallback: Extract token from header (usually lowercase in axios)
      token = parseJwtFromHeader(response.headers['authorization'] || response.headers['Authorization']);
      user = response.data?.data || response.data;
    }

    if (token && user) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.permissions) {
        user.permissions = decoded.permissions;
      }
    }

    return { token, user };
  },

  register: async (data: any) => {
    const response = await apiClient.post(API.AUTH.REGISTER, data);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.put(API.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await apiClient.post(API.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await apiClient.post(API.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  unlockAccount: async (username: string) => {
    const response = await apiClient.put(API.AUTH.UNLOCK(username));
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get(API.AUTH.PROFILE);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post(API.AUTH.LOGOUT);
    } catch (e) {
      console.warn("Logout request failed, proceeding with local logout");
    }
  },
};
