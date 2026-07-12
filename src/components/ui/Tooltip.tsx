import React, { useState, ReactNode } from 'react';

export interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: {
      tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      arrow: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    },
    bottom: {
      tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
      arrow: 'top-[-4px] left-1/2 -translate-x-1/2',
    },
    left: {
      tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
      arrow: 'right-[-4px] top-1/2 -translate-y-1/2',
    },
    right: {
      tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
      arrow: 'left-[-4px] top-1/2 -translate-y-1/2',
    },
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-md whitespace-nowrap pointer-events-none ${positions[position].tooltip}`}>
          {content}
          <div className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 pointer-events-none ${positions[position].arrow}`} />
        </div>
      )}
    </div>
  );
};
