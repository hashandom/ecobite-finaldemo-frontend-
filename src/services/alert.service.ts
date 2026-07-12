import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Alert } from '@/types';

export const AlertService = {
  getHistory: async (): Promise<Alert[]> => {
    const { data } = await apiClient.get(API.ALERTS.BASE);
    return data;
  },
  resolve: async (id: string): Promise<void> => {
    await apiClient.post(API.ALERTS.RESOLVE(id));
  },
};
