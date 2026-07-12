import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertBannerProps {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const AlertBanner = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}: AlertBannerProps) => {
  const styles = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info size={20} className="text-blue-500" /> },
    success: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', icon: <CheckCircle size={20} className="text-success" /> },
    warning: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', icon: <AlertTriangle size={20} className="text-warning" /> },
    danger: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', icon: <AlertCircle size={20} className="text-danger" /> },
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`flex items-start p-4 border rounded-lg ${style.bg} ${style.border} ${className}`}>
      <div className="flex-shrink-0 mr-3">{style.icon}</div>
      <div className={`flex-1 ${style.text}`}>
        {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
        <div className="text-sm opacity-90">{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className={`ml-3 flex-shrink-0 opacity-50 hover:opacity-100 ${style.text}`}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
