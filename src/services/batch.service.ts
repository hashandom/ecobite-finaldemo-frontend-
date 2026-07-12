import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Batch } from '@/types';

export const BatchService = {
  getAll: async (): Promise<Batch[]> => {
    const { data } = await apiClient.get(API.BATCHES.BASE);
    return data;
  },
  // We rename getAll to getByProduct since the real endpoint is product-scoped
  getByProduct: async (productId: string): Promise<Batch[]> => {
    const { data } = await apiClient.get(API.BATCHES.BY_PRODUCT(productId));
    return data;
  },
  getById: async (id: string): Promise<Batch> => {
    const { data } = await apiClient.get(API.BATCHES.BY_ID(id));
    return data;
  },
  create: async (batch: Partial<Batch>): Promise<Batch> => {
    const { data } = await apiClient.post(API.BATCHES.BASE, batch);
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
    return data;
  },
  allocate: async (productId: string, quantity: number): Promise<any> => {
    const { data } = await apiClient.post(API.BATCHES.ALLOCATE, { productId, quantity });
    if (data && typeof data === 'object' && (data.error || (!Array.isArray(data) && Object.keys(data).length > 0 && !data.message && !data.batchId))) {
      throw data;
    }
    return data;
  },
  reduce: async (id: string, soldQuantity: number): Promise<void> => {
    const { data } = await apiClient.post(API.BATCHES.REDUCE(id), { soldQuantity });
    if (data && typeof data === 'object' && (data.error || (!data.message && Object.keys(data).length > 0))) {
      throw data;
    }
  },
  spoil: async (id: string): Promise<void> => {
    const { data } = await apiClient.put(API.BATCHES.SPOIL(id));
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
  },
  recall: async (id: string): Promise<void> => {
    const { data } = await apiClient.put(API.BATCHES.RECALL(id));
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
  },
  getExpiringSoon: async (days: number): Promise<Batch[]> => {
    const { data } = await apiClient.get(`${API.BATCHES.EXPIRING_SOON}?days=${days}`);
    return data;
  },
  getCount: async (): Promise<number> => {
    const { data } = await apiClient.get(API.BATCHES.COUNT);
    return data;
  },
  getExpiringCount: async (): Promise<number> => {
    const { data } = await apiClient.get(API.BATCHES.EXPIRING_COUNT);
    return data;
  },
};
