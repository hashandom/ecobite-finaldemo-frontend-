import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface Option {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options = [],
  className = '',
  ...rest
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1 relative z-0">
      <div className="relative">
        <select
          ref={ref}
          className={`w-full rounded-lg border bg-card/50 backdrop-blur-sm px-3 pt-5 pb-2 text-text transition-all duration-300
            focus:outline-none focus:ring-2 focus:bg-card appearance-none
            ${error 
              ? 'border-danger focus:border-danger focus:ring-danger/20' 
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron for select */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        {label && (
          <label className={`absolute text-sm font-medium transition-all duration-300 pointer-events-none
            left-3 top-3 -translate-y-2.5 text-xs text-muted
            ${error ? 'text-danger' : ''}
          `}>
            {label}
          </label>
        )}
      </div>
      
      {/* Error message with slide down animation */}
      <div className={`grid transition-all duration-300 ease-in-out ${error ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <p className="overflow-hidden text-xs text-danger font-medium mt-0.5 ml-1">{error}</p>
      </div>
    </div>
  );
});

Select.displayName = 'Select';
