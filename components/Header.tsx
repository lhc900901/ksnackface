
import React from 'react';
import { InfoIcon } from './icons';

interface HeaderProps {
  onShowAllTypes: () => void;
  onReset: () => void;
  onLanguageToggle: () => void;
  language: 'ko' | 'en';
}

export const Header: React.FC<HeaderProps> = ({ onShowAllTypes, onReset, onLanguageToggle, language }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="font-bold text-xl tracking-wider cursor-pointer"
          onClick={onReset}
          role="button"
          tabIndex={0}
          aria-label={language === 'ko' ? "테스트 다시 시작하기" : "Restart Test"}
        >
          <span className="text-white">{language === 'ko' ? 'K-과자 유형 테스트' : 'K-Snack Type Test'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowAllTypes}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary text-sm text-gray-200 rounded-full hover:bg-gray-700 transition-colors"
            aria-label={language === 'ko' ? "모든 유형 설명 보기" : "View all type descriptions"}
          >
            <InfoIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ko' ? '유형 전체보기' : 'View All Types'}</span>
          </button>
          <button
            onClick={onLanguageToggle}
            className="w-10 text-center px-3 py-1.5 bg-brand-secondary text-sm font-bold text-gray-200 rounded-full hover:bg-gray-700 transition-colors"
            aria-label={language === 'ko' ? "언어 변경" : "Change Language"}
          >
            {language === 'ko' ? 'EN' : 'KO'}
          </button>
        </div>
      </div>
    </header>
  );
};
