
import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  language: 'ko' | 'en';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
        onImageSelect(file);
    }
  }, [onImageSelect]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="mt-8 p-8 md:p-12 border-2 border-dashed border-gray-600 rounded-2xl text-center cursor-pointer hover:border-brand-accent hover:bg-brand-secondary/30 transition-all duration-300"
      onClick={handleClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      <div className="flex flex-col items-center justify-center text-gray-400">
        <UploadIcon className="w-12 h-12 mb-4 text-gray-500" />
        <p className="text-lg font-semibold">
          {language === 'ko' 
            ? '사진을 여기에 끌어다 놓거나 클릭하여 업로드하세요' 
            : 'Drag & drop your photo here or click to upload'}
        </p>
        <p className="text-sm mt-1">
          {language === 'ko' 
            ? '얼굴이 잘 보이는 정면 사진을 사용해주세요.' 
            : 'Please use a clear, front-facing photo.'}
        </p>
      </div>
    </div>
  );
};
