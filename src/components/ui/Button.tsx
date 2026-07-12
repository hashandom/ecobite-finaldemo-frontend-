import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  type = 'button',
  className = '',
  onClick,
  ...rest
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg relative overflow-hidden';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
    secondary: 'bg-surface text-text border border-border hover:bg-gray-100 focus:ring-gray-200',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
    ghost: 'text-text hover:bg-gray-100 focus:ring-gray-200',
    outline: 'border-2 border-primary text-primary hover:bg-surface focus:ring-primary',
    gradient: 'bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary/30 focus:ring-primary border-none',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-lg px-6 py-3 gap-2.5',
    icon: 'p-2 flex-shrink-0',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};
