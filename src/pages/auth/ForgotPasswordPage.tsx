import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, Leaf } from 'lucide-react';
import { APP_CONFIG } from '@/constants/app.constants';

export const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { forgotPassword, loading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    const success = await forgotPassword(data.email);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      {/* Background split (teal top, gray bottom) */}
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
          <h1 className="text-2xl font-bold text-text">Forgot Password</h1>
          <p className="text-muted mt-2">Enter your email and we'll send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            icon={<Mail size={18} />}
            placeholder="Enter your registered email"
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            error={errors.email?.message as string}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
};
