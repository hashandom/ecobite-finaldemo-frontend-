import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Product } from '@/types';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get(API.PRODUCTS.BASE);
    return data;
  },
  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(API.PRODUCTS.BY_ID(id));
    return data;
  },
  create: async (product: Partial<Product>): Promise<Product> => {
    const { data } = await apiClient.post(API.PRODUCTS.BASE, product);
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
    return data;
  },
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await apiClient.put(API.PRODUCTS.BY_ID(id), product);
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.PRODUCTS.BY_ID(id));
  },
  search: async (name: string): Promise<Product[]> => {
    const { data } = await apiClient.get(`${API.PRODUCTS.SEARCH}?name=${name}`);
    return data;
  },
  getByCategory: async (category: string): Promise<Product[]> => {
    const { data } = await apiClient.get(API.PRODUCTS.BY_CATEGORY(category));
    return data;
  },
  getLowStock: async (): Promise<Product[]> => {
    const { data } = await apiClient.get(API.PRODUCTS.LOW_STOCK);
    return data;
  },
  getLowStockCount: async (): Promise<number> => {
    const { data } = await apiClient.get(API.PRODUCTS.LOW_STOCK_COUNT);
    return data;
  },
  updateStock: async (id: string, stock: number): Promise<void> => {
    await apiClient.put(`${API.PRODUCTS.UPDATE_STOCK(id)}?stock=${stock}`);
  }
};
