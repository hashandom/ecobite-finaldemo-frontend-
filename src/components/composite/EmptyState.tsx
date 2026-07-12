import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: any;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  title = 'No results found',
  message = 'Try adjusting your filters or search query.',
  icon: Icon = Search,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-xl border-dashed ${className}`}>
      <div className="text-muted/50 mb-4">{typeof Icon === 'function' ? <Icon size={48} /> : Icon}</div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-sm">{message}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
