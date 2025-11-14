
import React from 'react';
import type { SnackTypeInfo } from '../types';
import { CloseIcon } from './icons';

interface AllTypesModalProps {
  show: boolean;
  onClose: () => void;
  snackTypes: SnackTypeInfo[];
}

export const AllTypesModal: React.FC<AllTypesModalProps> = ({ show, onClose, snackTypes }) => {
  if (!show) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-brand-secondary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">K-과자 유형 전체보기</h2>
        <div className="space-y-4">
          {snackTypes.map((type) => (
            <div key={type.id} className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-bold text-brand-accent">{type.vibe} - {type.snack}</h3>
              <p className="text-gray-300 mt-1 text-sm">{type.definition}</p>
              <p className="text-xs text-gray-500 mt-2">대표 연예인: {type.stars}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
