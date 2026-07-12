import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { Location } from '@/types';

export const LocationService = {
  getAll: async (): Promise<Location[]> => {
    const { data } = await apiClient.get(API.LOCATIONS.BASE);
    return data;
  },
  getById: async (id: number | string): Promise<Location> => {
    const { data } = await apiClient.get(API.LOCATIONS.BY_ID(id));
    return data;
  },
  create: async (location: Partial<Location>): Promise<Location> => {
    const { data } = await apiClient.post(API.LOCATIONS.BASE, location);
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
    return data;
  },
  assignBatch: async (batchId: number | string, locationId: number | string, quantity: number): Promise<void> => {
    const { data } = await apiClient.post(API.LOCATIONS.ASSIGN, { batchId, locationId, quantity });
    if (data && typeof data === 'object' && (data.error || (!data.message && Object.keys(data).length > 0))) {
      throw data;
    }
  },
  moveBatch: async (batchId: number | string, fromLocationId: number | string, toLocationId: number | string, quantity: number): Promise<void> => {
    const { data } = await apiClient.post(API.LOCATIONS.MOVE, { batchId, fromLocationId, toLocationId, quantity });
    if (data && typeof data === 'object' && (data.error || (!data.message && Object.keys(data).length > 0))) {
      throw data;
    }
  },
  getInventory: async (id: number | string): Promise<any[]> => {
    const { data } = await apiClient.get(API.LOCATIONS.INVENTORY(id));
    return data;
  },
  getLocationsByBatch: async (batchId: number | string): Promise<any[]> => {
    const { data } = await apiClient.get(API.LOCATIONS.BY_BATCH(batchId));
    return data;
  },
  update: async (id: number | string, location: Partial<Location>): Promise<Location> => {
    const { data } = await apiClient.put(API.LOCATIONS.BY_ID(id), location);
    if (data && typeof data === 'object' && (data.error || (!data.id && Object.keys(data).length > 0))) {
      throw data;
    }
    return data;
  },
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(API.LOCATIONS.BY_ID(id));
  },
  getCount: async (): Promise<number> => {
    const { data } = await apiClient.get(API.LOCATIONS.WAREHOUSE_COUNT);
    return data;
  }
};
