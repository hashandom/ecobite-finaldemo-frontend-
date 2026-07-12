import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
  label?: string;
}

export const FilterBar = ({ options, value, onChange, className = '', label = 'Filter by' }: FilterBarProps) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 ${className}`}>
      {options.map((opt: FilterOption) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
            ${value === opt.value 
              ? 'bg-text text-card' 
              : 'bg-surface text-muted hover:text-text hover:bg-border border border-transparent hover:border-border'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
