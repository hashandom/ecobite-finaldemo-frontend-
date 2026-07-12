import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) => {
  return (
    <div className={`w-full max-w-sm ${className}`}>
      <Input
        icon={<Search size={18} />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
