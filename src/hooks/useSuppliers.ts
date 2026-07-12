import { useState, useEffect, useCallback } from 'react';
import { Supplier } from '@/types';
import { SupplierService } from '@/services/supplier.service';
import toast from 'react-hot-toast';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SupplierService.getAll();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suppliers');
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSupplierError = (err: any, fallbackMessage: string) => {
    const data = err.response?.data;
    if (data) {
      if (typeof data === 'object') {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        // It could be a validation map: { phone: "...", contactEmail: "..." }
        const messages = Object.values(data).filter(v => typeof v === 'string') as string[];
        if (messages.length > 0) {
          messages.forEach(msg => toast.error(msg));
          return;
        }
      } else if (typeof data === 'string') {
        toast.error(data);
        return;
      }
    }
    toast.error(err.message || fallbackMessage);
  };

  const createSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      await SupplierService.create(supplierData);
      await fetchSuppliers();
      toast.success('Supplier created successfully');
      return true;
    } catch (err: any) {
      handleSupplierError(err, 'Failed to create supplier');
      return false;
    }
  };

  const updateSupplier = async (id: number | string, supplierData: Partial<Supplier>) => {
    try {
      await SupplierService.update(id, supplierData);
      await fetchSuppliers();
      toast.success('Supplier updated successfully');
      return true;
    } catch (err: any) {
      handleSupplierError(err, 'Failed to update supplier');
      return false;
    }
  };

  const deleteSupplier = async (id: number | string) => {
    try {
      await SupplierService.delete(id);
      await fetchSuppliers();
      toast.success('Supplier deleted successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete supplier');
      return false;
    }
  };

  const updateRating = async (id: number | string, rating: number) => {
    try {
      await SupplierService.updateRating(id, rating);
      await fetchSuppliers();
      toast.success('Rating updated');
      return true;
    } catch (err: any) {
      toast.error('Failed to update rating');
      return false;
    }
  };

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    updateRating
  };
};
