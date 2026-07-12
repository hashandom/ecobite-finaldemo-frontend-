import React, { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  rows = 4,
  className = '',
  ...rest
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1 relative z-0">
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          placeholder={label ? " " : rest.placeholder}
          className={`peer w-full rounded-lg border bg-card/50 backdrop-blur-sm px-3 pt-5 pb-2 text-text placeholder-transparent transition-all duration-300
            focus:outline-none focus:ring-2 focus:bg-card resize-y
            ${error 
              ? 'border-danger focus:border-danger focus:ring-danger/20' 
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${className}`}
          {...rest}
        />
        {label && (
          <label className={`absolute text-sm font-medium transition-all duration-300 pointer-events-none
            left-3 top-3 -translate-y-2.5 text-xs text-primary
            peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted
            peer-focus:top-3 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:text-primary
            ${error ? 'text-danger peer-focus:text-danger' : ''}
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

Textarea.displayName = 'Textarea';
