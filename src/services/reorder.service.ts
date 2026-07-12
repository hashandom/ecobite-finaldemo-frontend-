import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Reorder, LowStockSupplier } from '@/types';

export const ReorderService = {
  create: async (productId: string, quantity: number): Promise<Reorder> => {
    const { data } = await apiClient.post(API.REORDERS.BASE, { productId, quantity });
    return data;
  },
  getAll: async (): Promise<Reorder[]> => {
    const { data } = await apiClient.get(API.REORDERS.BASE);
    return data;
  },
  updateStatus: async (id: string | number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED'): Promise<Reorder> => {
    const { data } = await apiClient.put(API.REORDERS.STATUS(id), { status });
    return data;
  },
  getPendingCount: async (): Promise<number> => {
    const { data } = await apiClient.get(API.REORDERS.PENDING_COUNT);
    return data;
  },
  getLowStockSuppliers: async (): Promise<LowStockSupplier[]> => {
    const { data } = await apiClient.get(API.REORDERS.LOW_STOCK_SUPPLIERS);
    return data;
  }
};
