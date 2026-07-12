import React, { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/ui';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'warning';
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <div className="p-3 bg-danger/10 text-danger rounded-full"><Trash2 size={24} /></div>;
      case 'warning': return <div className="p-3 bg-warning/10 text-warning rounded-full"><AlertTriangle size={24} /></div>;
      default: return <div className="p-3 bg-primary/10 text-primary rounded-full"><Info size={24} /></div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {getIcon()}
          <span>{title}</span>
        </div>
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant as any} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="px-6 py-4 overflow-y-auto">
        <p className="text-muted">{message}</p>
      </div>
    </Modal>
  );
};
