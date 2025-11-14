
import React from 'react';
import { InfoIcon } from './icons';

interface HeaderProps {
  onShowAllTypes: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowAllTypes, onReset }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="font-bold text-xl tracking-wider cursor-pointer"
          onClick={onReset}
          role="button"
          tabIndex={0}
          aria-label="테스트 다시 시작하기"
        >
          <span className="text-white">K-과자 유형 테스트</span>
          <span className="text-gray-400 ml-2 text-sm hidden sm:inline">K-snack face test</span>
        </div>
        <button
          onClick={onShowAllTypes}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary text-sm text-gray-200 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="모든 유형 설명 보기"
        >
          <InfoIcon className="w-4 h-4" />
          <span className="hidden sm:inline">유형 전체보기</span>
        </button>
      </div>
    </header>
  );
};
