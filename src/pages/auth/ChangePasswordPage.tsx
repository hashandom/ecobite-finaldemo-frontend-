import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';
import { Button, Input } from '@/components/ui';
import { Lock, KeyRound, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChangePasswordPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const newPassword = watch('newPassword');

  const onSubmit = async (data: any) => {
    if (!user?.username) {
      toast.error('User session not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.changePassword({
        username: user.username,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      if (res && res.status === false) {
        toast.error(res.message || 'Failed to update password');
      } else {
        toast.success(res?.message || 'Password updated successfully');
        
        // Update user state to clear firstLogin flag
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.setState({ user: { ...currentUser, firstLogin: false } });
        }
        
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      {/* Background split */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-[45%] bg-primary"></div>
        <div className="h-[55%] bg-surface"></div>
      </div>

      {/* Change Password Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text">Change Password</h1>
          <p className="text-muted mt-2">
            This is your first login. For security reasons, please change your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="Enter current password"
            {...register('oldPassword', { required: 'Current password is required' })}
            error={errors.oldPassword?.message as string}
          />

          <Input
            label="New Password"
            type="password"
            icon={<KeyRound size={18} />}
            placeholder="Enter new password"
            {...register('newPassword', { 
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={errors.newPassword?.message as string}
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={<KeyRound size={18} />}
            placeholder="Confirm new password"
            {...register('confirmPassword', { 
              required: 'Please confirm your new password',
              validate: (val) => val === newPassword || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message as string}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
