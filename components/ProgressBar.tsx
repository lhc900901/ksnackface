import React from 'react';

interface ProgressBarProps {
  percentage: number;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, colorClass = 'bg-brand-accent' }) => {
  return (
    <div
      className="bg-gray-700 rounded-full h-2.5 w-full"
    >
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};
