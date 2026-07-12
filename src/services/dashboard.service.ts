import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import { DashboardStats } from '@/types';

export const DashboardService = {
  getOverview: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get(API.DASHBOARD.OVERVIEW);
    // Extract real API nested "data" property if present
    const raw = data.success && data.data ? data.data : data;
    
    return {
      totalProducts: raw.inventory?.totalProducts ?? 0,
      totalBatches: raw.batch?.totalBatches ?? 0,
      lowStockItems: raw.inventory?.lowStockProducts ?? 0,
      activeAlerts: raw.notification?.unreadNotifications ?? 0,
      totalSuppliers: raw.supplier?.totalSuppliers ?? 0,
      pendingReorders: raw.reorder?.pendingReorders ?? 0,
      warehouseCount: raw.location?.warehouseCount ?? 0,
      expiringSoon: raw.batch?.expiringSoon ?? 0,
      recentActivity: raw.recentActivity || []
    };
  },
  getMonthlyAnalytics: async (): Promise<any[]> => {
    const { data } = await apiClient.get(API.ANALYTICS.MONTHLY);
    
    // If response is a single object, format it as an array for chart consumption
    if (data && !Array.isArray(data)) {
      return [
        { month: 'Target', totalValue: (data.monthlySales || 50000.0) * 0.8 },
        { month: 'Current Month', totalValue: data.monthlySales || 50000.0 }
      ];
    }
    return data;
  }
};
