
import React from 'react';

interface LoadingSpinnerProps {
  language: 'ko' | 'en';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ language }) => {
  return (
    <div className="flex flex-col items-center justify-center my-16">
      <div className="w-12 h-12 border-4 border-t-brand-accent border-gray-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-300 animate-pulse">
        {language === 'ko' ? '당신의 과자 유형을 분석하고 있습니다...' : 'Analyzing your snack type...'}
      </p>
    </div>
  );
};
