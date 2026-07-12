import { useState, useEffect, useCallback } from 'react';
import { Location } from '@/types';
import { LocationService } from '@/services/location.service';
import toast from 'react-hot-toast';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LocationService.getAll();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch locations');
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleLocationError = (errorResponse: any) => {
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

  const createLocation = async (locationData: Partial<Location>) => {
    try {
      await LocationService.create(locationData);
      await fetchLocations();
      toast.success('Location created successfully');
      return true;
    } catch (err: any) {
      handleLocationError(err.response?.data || err);
      return false;
    }
  };

  const assignBatch = async (batchId: number | string, locationId: number | string, quantity: number) => {
    try {
      await LocationService.assignBatch(batchId, locationId, quantity);
      await fetchLocations();
      toast.success('Batch assigned to location');
      return true;
    } catch (err: any) {
      handleLocationError(err.response?.data || err);
      return false;
    }
  };

  const moveBatch = async (batchId: number | string, fromLocationId: number | string, toLocationId: number | string, quantity: number) => {
    try {
      await LocationService.moveBatch(batchId, fromLocationId, toLocationId, quantity);
      await fetchLocations();
      toast.success('Batch moved successfully');
      return true;
    } catch (err: any) {
      handleLocationError(err.response?.data || err);
      return false;
    }
  };

  const updateLocation = async (id: number | string, locationData: Partial<Location>) => {
    try {
      await LocationService.update(id, locationData);
      await fetchLocations();
      toast.success('Location updated successfully');
      return true;
    } catch (err: any) {
      handleLocationError(err.response?.data || err);
      return false;
    }
  };

  const deleteLocation = async (id: number | string) => {
    try {
      await LocationService.delete(id);
      await fetchLocations();
      toast.success('Location deleted successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete location');
      return false;
    }
  };

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    assignBatch,
    moveBatch
  };
};
