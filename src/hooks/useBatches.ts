import { useState, useEffect, useCallback } from 'react';
import { Batch } from '@/types';
import { BatchService } from '@/services/batch.service';
import { API } from '@/constants/api.constants';
import apiClient from '@/config/axios.config';
import toast from 'react-hot-toast';

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBatchError = (errorResponse: any) => {
    if (typeof errorResponse === 'object' && errorResponse !== null) {
      if (errorResponse.error) {
        toast.error(errorResponse.error);
        return;
      }
      const errorKeys = Object.keys(errorResponse);
      const validationKeys = errorKeys.filter(k => k !== 'status' && k !== 'message' && k !== 'data');
      if (validationKeys.length > 0) {
        validationKeys.forEach(key => {
          toast.error(errorResponse[key]);
        });
        return;
      }
    }
    toast.error(errorResponse?.message || 'An unexpected error occurred');
  };

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BatchService.getAll();
      
      // Implement FEFO sort (First Expired First Out) automatically
      const sorted = [...data].sort((a, b) => {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
      
      setBatches(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch batches');
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const createBatch = async (batchData: Partial<Batch>) => {
    try {
      await BatchService.create(batchData);
      await fetchBatches();
      
      toast.success('Batch added successfully');
      return true;
    } catch (err: any) {
      handleBatchError(err.response?.data || err);
      return false;
    }
  };

  const spoilBatch = async (id: string) => {
    try {
      await BatchService.spoil(id);
      await fetchBatches();
      toast.success('Batch marked as spoiled');
      return true;
    } catch (err: any) {
      handleBatchError(err.response?.data || err);
      return false;
    }
  };

  const recallBatch = async (id: string) => {
    try {
      await BatchService.recall(id);
      await fetchBatches();
      toast.success('Batch recalled successfully');
      return true;
    } catch (err: any) {
      handleBatchError(err.response?.data || err);
      return false;
    }
  };

  const allocateBatch = async (productId: string, quantity: number) => {
    try {
      await BatchService.allocate(productId, quantity);
      await fetchBatches();
      toast.success('Stock allocated successfully');
      return true;
    } catch (err: any) {
      handleBatchError(err.response?.data || err);
      return false;
    }
  };

  const reduceStock = async (id: string, soldQuantity: number) => {
    try {
      await BatchService.reduce(id, soldQuantity);
      await fetchBatches();
      toast.success('Stock reduced successfully');
      return true;
    } catch (err: any) {
      handleBatchError(err.response?.data || err);
      return false;
    }
  };

  return {
    batches,
    loading,
    error,
    refetch: fetchBatches,
    createBatch,
    spoilBatch,
    recallBatch,
    allocateBatch,
    reduceStock
  };
};
