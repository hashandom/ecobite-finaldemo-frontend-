import React from 'react';

export interface PeriodToggleProps {
  options?: string[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const PeriodToggle = ({ options = ['Daily', 'Weekly', 'Monthly'], value, onChange, className = '' }: PeriodToggleProps) => {
  return (
    <div className={`inline-flex p-1 bg-surface border border-border rounded-lg ${className}`}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors
            ${value === opt
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted hover:text-text'
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};
