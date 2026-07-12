import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '@/types';
import { DashboardService } from '@/services/dashboard.service';
import { BatchService } from '@/services/batch.service';
import apiClient from '@/config/axios.config';
import { API } from '@/constants/api.constants';
import toast from 'react-hot-toast';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any | null>(null);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, monthlyRes, expBatches] = await Promise.all([
        DashboardService.getOverview().catch((err) => {
          console.error('Failed to load overview data', err);
          return null;
        }),
        apiClient.get(API.ANALYTICS.MONTHLY).catch((err) => {
          console.error('Failed to load monthly analytics data', err);
          return { data: null };
        }),
        BatchService.getExpiringSoon(7).catch((err) => {
          console.error('Failed to load expiring soon batches', err);
          return [];
        })
      ]);

      const responseData = monthlyRes?.data;
      const rawMonthly = responseData && typeof responseData === 'object'
        ? (responseData.data !== undefined ? responseData.data : (responseData.success && responseData.data ? responseData.data : responseData))
        : null;

      setStats(overviewData);
      setMonthlyData(rawMonthly);

      if (rawMonthly && !Array.isArray(rawMonthly)) {
        setMonthlyAnalytics([
          { month: 'Target', totalValue: (rawMonthly.monthlySales || 50000.0) * 0.8 },
          { month: 'Current Month', totalValue: rawMonthly.monthlySales || 50000.0 }
        ]);
      } else {
        setMonthlyAnalytics(rawMonthly || []);
      }

      setExpiringBatches(expBatches as any[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to connect to backend for dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    monthlyAnalytics,
    monthlyData,
    expiringBatches,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
