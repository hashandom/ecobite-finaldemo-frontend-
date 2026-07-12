import React, { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'primary';
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({
  children,
  variant = 'primary',
  dot = false,
  size = 'md',
  className = '',
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-blue-100 text-blue-700',
    muted: 'bg-gray-100 text-muted',
    primary: 'bg-primary/10 text-primary',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-0.5 gap-1.5',
  };

  const dotColors = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-blue-500',
    muted: 'bg-muted',
    primary: 'bg-primary',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
