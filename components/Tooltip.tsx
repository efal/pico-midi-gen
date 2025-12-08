
import React, { useState, useRef } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: Position;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsVisible(true), 600);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // Simplified: No onClick blocking, pure hover for desktop.
  // On mobile, tooltips are less critical than button functionality.
  return (
    <div
      className={`relative inline-block ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        role="tooltip"
        className={`tooltip-popup absolute w-64 p-3 text-sm font-normal text-white bg-gray-800 border border-gray-700 rounded-lg shadow-lg pointer-events-none z-50 ${isVisible ? 'visible' : ''}`}
        data-popper-placement={position}
      >
        {content}
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    </div>
  );
};

export default Tooltip;
