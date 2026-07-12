import { useState, useCallback } from 'react';
import { UserService } from '@/services/user.service';
import { User } from '@/types';
import toast from 'react-hot-toast';

export const useUsers = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UserService.getStaff();
      setStaff(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const response = await UserService.createStaff(userData);
      await fetchStaff();
      toast.success('Staff member added successfully');
      return response;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add staff member');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStaff = async (id: string | number, userData: Partial<User>) => {
    setLoading(true);
    try {
      await UserService.updateUser(id, userData);
      await fetchStaff();
      toast.success('Staff member updated successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update staff member');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string | number) => {
    try {
      await UserService.deleteUser(id);
      await fetchStaff();
      toast.success('User deleted successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user');
      return false;
    }
  };

  const getUserById = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      return await UserService.getUserById(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load user details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    staff,
    loading,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteUser,
    getUserById
  };
};
