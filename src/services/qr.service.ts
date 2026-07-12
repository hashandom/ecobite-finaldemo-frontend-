import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { QRCodeData } from '@/types';

export const QRService = {
  getAll: async (): Promise<QRCodeData[]> => {
    // There is no endpoint to fetch all QR codes, returning empty list.
    return [];
  },

  generate: async (batchId: number | string): Promise<QRCodeData> => {
    const { data } = await apiClient.post(API.QR.GENERATE, { batchId });
    const qr = data.data || data;
    return {
      ...qr,
      qrImageUrl: API.QR.IMAGE(qr.qrCodeId)
    };
  },

  scan: async (qrCodeId: string): Promise<any> => {
    const { data } = await apiClient.get(API.QR.SCAN(qrCodeId));
    return data.data || data;
  },

  getByBatch: async (batchId: number | string): Promise<QRCodeData> => {
    const { data } = await apiClient.get(API.QR.BY_BATCH(batchId));
    const qr = data.data || data;
    return {
      ...qr,
      qrImageUrl: API.QR.IMAGE(qr.qrCodeId)
    };
  }
};
