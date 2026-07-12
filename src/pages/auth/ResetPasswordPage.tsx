import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyRound, ArrowLeft, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      navigate('/login');
    }
  }, [token, navigate]);

  const onSubmit = async (data: any) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await AuthService.resetPassword({
        token: token,
        newPassword: data.newPassword,
      });

      if (res && res.status === false) {
        toast.error(res.message || 'Failed to reset password');
      } else {
        toast.success(res?.message || 'Password reset successfully');
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred while resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      {/* Background split */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-[45%] bg-primary"></div>
        <div className="h-[55%] bg-surface"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted hover:text-primary transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text">Reset Password</h1>
          <p className="text-muted mt-2">Create a new secure password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};
