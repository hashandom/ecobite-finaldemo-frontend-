import { useState, useEffect, useCallback } from 'react';
import { RoleService } from '@/services/role.service';
import { Role } from '@/types';
import toast from 'react-hot-toast';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await RoleService.getRoles();
      setRoles(data);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (roleData: Partial<Role>) => {
    setLoading(true);
    try {
      await RoleService.createRole(roleData);
      await fetchRoles();
      toast.success('Role created successfully');
      return true;
    } catch {
      toast.error('Failed to create role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string | number, roleData: Partial<Role>) => {
    setLoading(true);
    try {
      await RoleService.updateRole(id, roleData);
      await fetchRoles();
      toast.success('Role updated successfully');
      return true;
    } catch {
      toast.error('Failed to update role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    refetch: fetchRoles,
    createRole,
    updateRole
  };
};
