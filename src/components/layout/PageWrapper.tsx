import { ReactNode } from 'react';

export const PageWrapper = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`p-8 max-w-7xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
};
