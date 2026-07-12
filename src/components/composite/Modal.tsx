import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, size = 'md', children, footer }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div 
        className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] sm:my-8 animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-surface/30 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-text">{title}</h3>
            <button 
              onClick={onClose}
              className="text-muted hover:text-text focus:outline-none p-1.5 rounded-lg hover:bg-surface transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-surface/30 flex justify-end gap-3 shrink-0 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.Footer = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-t border-border bg-surface flex justify-end gap-3 ${className}`}>{children}</div>
);
