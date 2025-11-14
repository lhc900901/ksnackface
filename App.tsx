
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { AllTypesModal } from './components/AllTypesModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeKsnackFace } from './services/geminiService';
import type { AnalysisResult } from './types';
import { KSNACK_TYPES } from './constants';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllTypes, setShowAllTypes] = useState<boolean>(false);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

  const handleImageSelect = useCallback(async (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const base64Image = await fileToBase64(file);
      const result = await analyzeKsnackFace(base64Image);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = language === 'ko' 
        ? '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        : 'An error occurred during analysis. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove "data:image/jpeg;base64," part
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };


  return (
    <div className="bg-brand-dark min-h-screen text-brand-light font-sans">
      <Header 
        onShowAllTypes={() => setShowAllTypes(true)} 
        onReset={resetState}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />
      
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-red-400 to-yellow-500 bg-clip-text text-transparent !leading-tight">
              {language === 'ko' ? 'K-과자 유형 테스트' : 'K-Snack Type Test'}
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              {language === 'ko' ? '당신은 어떤 K-과자 유형과 어울릴까요?' : 'Which K-snack type do you match with?'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {language === 'ko' ? '🔐 무료\u00A0\u00A0📸 사진은 저장되지 않습니다. 🛡️' : '🔐 Free\u00A0\u00A0📸 Photos are not saved. 🛡️'}
            </p>
        </div>

        {!imageUrl && (
            <div className="w-4/5 md:w-3/5 mx-auto">
              <ImageUploader onImageSelect={handleImageSelect} language={language} />
            </div>
        )}

        {error && (
            <div className="mt-8 text-center bg-red-900/50 p-4 rounded-lg">
                <p className="text-red-300">{error}</p>
                <button
                    onClick={resetState}
                    className="mt-4 px-4 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
                >
                    {language === 'ko' ? '다시 시작하기' : 'Start Over'}
                </button>
            </div>
        )}

        {isLoading && <LoadingSpinner language={language} />}

        {analysisResult && imageUrl && (
             <ResultDisplay 
                result={analysisResult} 
                imageUrl={imageUrl} 
                onReset={resetState} 
                snackTypes={KSNACK_TYPES}
                language={language}
            />
        )}
      </main>

      <AllTypesModal
        show={showAllTypes}
        onClose={() => setShowAllTypes(false)}
        snackTypes={KSNACK_TYPES}
        language={language}
      />
    </div>
  );
};

export default App;
