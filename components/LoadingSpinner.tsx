
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-16">
      <div className="w-12 h-12 border-4 border-t-brand-accent border-gray-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-300 animate-pulse">AI가 당신의 과자상을 분석하고 있습니다...</p>
    </div>
  );
};
