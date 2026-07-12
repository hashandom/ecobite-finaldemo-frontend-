import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon,
  iconRight,
  type = 'text',
  className = '',
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1 relative z-0">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={currentType}
          placeholder={label ? " " : rest.placeholder}
          className={`peer w-full rounded-lg border bg-card/50 backdrop-blur-sm px-3 text-text transition-all duration-300
            ${label ? 'pt-5 pb-2 placeholder-transparent' : 'py-2.5'}
            focus:outline-none focus:ring-2 focus:bg-card
            ${icon ? 'pl-10' : ''} 
            ${iconRight || isPassword ? 'pr-10' : ''}
            ${error 
              ? 'border-danger focus:border-danger focus:ring-danger/20' 
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${className}`}
          {...rest}
        />
        {label && (
          <label className={`absolute text-sm font-medium transition-all duration-300 pointer-events-none
            ${icon ? 'left-10' : 'left-3'}
            top-3 -translate-y-2.5 text-xs text-primary
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted
            peer-focus:top-3 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:text-primary
            peer-autofill:top-3 peer-autofill:-translate-y-2.5 peer-autofill:text-xs peer-autofill:text-primary
            ${error ? 'text-danger peer-focus:text-danger peer-autofill:text-danger' : ''}
          `}>
            {label}
          </label>
        )}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text focus:outline-none z-10 p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10">
            {iconRight}
          </div>
        )}
      </div>
      
      {/* Error message with slide down animation */}
      <div className={`grid transition-all duration-300 ease-in-out ${error ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <p className="overflow-hidden text-xs text-danger font-medium mt-0.5 ml-1">{error}</p>
      </div>
      
      {hint && !error && <p className="text-xs text-muted ml-1">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
