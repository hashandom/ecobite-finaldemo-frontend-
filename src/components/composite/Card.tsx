import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
  gradient?: boolean;
  hoverable?: boolean;
}

export const Card = ({ children, title, action, className = '', noPadding = false, gradient = false, hoverable = false }: CardProps) => {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300
      ${hoverable ? 'hover:shadow-md hover:-translate-y-1' : ''} 
      ${className}`}
    >
      {gradient && <div className="h-1.5 w-full bg-gradient-primary" />}
      
      {(title || action) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
