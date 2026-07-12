import { useState, useEffect, useCallback } from 'react';
import { ReorderService } from '@/services/reorder.service';
import { Reorder, LowStockSupplier } from '@/types';
import toast from 'react-hot-toast';

import { ProductService } from '@/services/product.service';

export const useReorders = () => {
  const [reorders, setReorders] = useState<Reorder[]>([]);
  const [lowStockSuppliers, setLowStockSuppliers] = useState<LowStockSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReorders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReorderService.getAll();
      const sorted = [...data].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setReorders(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reorders');
      toast.error('Failed to load reorders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLowStockSuppliers = useCallback(async () => {
    setLoadingLowStock(true);
    try {
      const data = await ReorderService.getLowStockSuppliers();
      setLowStockSuppliers(data);
    } catch (err: any) {
      console.warn('Failed to fetch low stock suppliers from API, falling back to local calculation:', err);
      try {
        const products = await ProductService.getAll();
        const fallbackSuppliers: LowStockSupplier[] = products
          .filter(p => (p.stock || 0) <= (p.reorderLevel || 0))
          .map(p => ({
            productId: p.id,
            productName: p.name,
            currentStock: p.stock || 0,
            reorderLevel: p.reorderLevel || 0,
            supplierId: null,
            supplierName: null,
            supplierEmail: null,
            supplierPhone: null
          }));
        setLowStockSuppliers(fallbackSuppliers);
      } catch (prodErr) {
        console.error('Failed to get products for fallback:', prodErr);
        toast.error('Failed to load low stock suppliers');
      }
    } finally {
      setLoadingLowStock(false);
    }
  }, []);

  useEffect(() => {
    fetchReorders();
  }, [fetchReorders]);

  const createReorder = async (productId: string, quantity: number) => {
    try {
      const newReorder = await ReorderService.create(productId, quantity);
      setReorders(prev => [newReorder, ...prev]);
      toast.success('Reorder created successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create reorder');
      return false;
    }
  };

  const updateReorderStatus = async (id: string | number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED') => {
    try {
      const updated = await ReorderService.updateStatus(id, status);
      setReorders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Reorder marked as ${status.toLowerCase()}`);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
      return false;
    }
  };

  return {
    reorders,
    lowStockSuppliers,
    loading,
    loadingLowStock,
    error,
    refetch: fetchReorders,
    fetchLowStockSuppliers,
    createReorder,
    updateReorderStatus
  };
};
