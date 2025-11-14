
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
      setError('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      <Header onShowAllTypes={() => setShowAllTypes(true)} onReset={resetState} />
      
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI K-과자 유형 테스트</h1>
            <p className="mt-2 text-lg text-gray-400">당신의 얼굴은 어떤 K-과자상일까요?</p>
        </div>

        {!imageUrl && (
            <ImageUploader onImageSelect={handleImageSelect} />
        )}

        {error && (
            <div className="mt-8 text-center bg-red-900/50 p-4 rounded-lg">
                <p className="text-red-300">{error}</p>
                <button
                    onClick={resetState}
                    className="mt-4 px-4 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-pink-600 transition-colors"
                >
                    다시 시작하기
                </button>
            </div>
        )}

        {isLoading && <LoadingSpinner />}

        {analysisResult && imageUrl && (
             <ResultDisplay 
                result={analysisResult} 
                imageUrl={imageUrl} 
                onReset={resetState} 
                snackTypes={KSNACK_TYPES}
            />
        )}
      </main>

      <AllTypesModal
        show={showAllTypes}
        onClose={() => setShowAllTypes(false)}
        snackTypes={KSNACK_TYPES}
      />
    </div>
  );
};

export default App;
