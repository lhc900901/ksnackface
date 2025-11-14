
import React, { useRef, useState } from 'react';
import type { AnalysisResult, SnackTypeInfo } from '../types';
import { ProgressBar } from './ProgressBar';
import { ResetIcon, ShareIcon, SpinnerIcon } from './icons';

// Add type definition for html2canvas
declare const html2canvas: any;

interface ResultDisplayProps {
  result: AnalysisResult;
  imageUrl: string;
  onReset: () => void;
  snackTypes: SnackTypeInfo[];
  language: 'ko' | 'en';
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, imageUrl, onReset, snackTypes, language }) => {
  const primaryMatchInfo = snackTypes.find(type => type.id === result.primary_match_id);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!primaryMatchInfo) {
    return <div className="text-center text-red-500">Could not find result information.</div>;
  }

  const handleShare = async () => {
    if (!resultCardRef.current || isSharing) return;
    setIsSharing(true);
    const url = window.location.href;

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#393939', // bg-brand-secondary
        useCORS: true,
        onclone: (document) => {
          // Hide buttons on the cloned document to not include them in the screenshot
          const buttons = document.querySelector('.share-buttons-container');
          if (buttons) {
            (buttons as HTMLElement).style.display = 'none';
          }
        },
      });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (!blob) {
        throw new Error('Failed to create image blob.');
      }
      
      const file = new File([blob], 'ksnack-face-result.png', { type: 'image/png' });
      const shareText = language === 'ko' 
        ? `저의 K-과자 유형은 '${primaryMatchInfo.snack}'래요! 당신의 유형도 알아보세요! #K과자상테스트\n${url}`
        : `My K-Snack type is '${primaryMatchInfo.snack_en}'! Find out your type too! #KSnackFaceTest\n${url}`;

      const shareData = {
        title: language === 'ko' ? 'K-과자 유형 테스트 결과' : 'K-Snack Type Test Result',
        text: shareText,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ksnack-face-result.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(language === 'ko' ? '결과 이미지가 다운로드되었습니다. 직접 공유해주세요!' : 'Result image downloaded. Please share it manually!');
      }
    } catch (error) {
        const err = error as Error;
        if (err.name !== 'AbortError') { // Don't show error if user cancels share dialog
            console.error('Sharing failed:', error);
            alert(language === 'ko' ? '공유에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'Sharing failed. Please try again later.');
        }
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <div className="mt-8 animate-fade-in">
        <div ref={resultCardRef} className="p-6 bg-brand-secondary rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="w-full aspect-square rounded-xl overflow-hidden">
                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-lg text-brand-accent font-semibold">{language === 'ko' ? primaryMatchInfo.vibe : primaryMatchInfo.vibe_en}</p>
                    <h2 className="text-4xl font-extrabold my-2">
                        <span className={primaryMatchInfo.colorClass}>{language === 'ko' ? primaryMatchInfo.snack : primaryMatchInfo.snack_en}</span>
                        {language === 'ko' ? ' 유형' : ' Type'}
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        "{language === 'ko' ? result.kstar_match_reason_kr : (result.kstar_match_reason_en || result.kstar_match_reason_kr)}"
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 font-semibold">{language === 'ko' ? '같은 유형의 K-스타' : 'K-Stars of the Same Type'}</p>
                        <p className="text-lg text-white font-bold">{language === 'ko' ? primaryMatchInfo.stars : primaryMatchInfo.stars_en}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-700">
                <h3 className="text-xl font-bold text-center mb-3">{language === 'ko' ? '일치도 Top 3' : 'Top 3 Matches'}</h3>
                <div className="space-y-3">
                    {result.top_3_matches.map((match) => {
                        const matchInfo = snackTypes.find(type => type.id === match.match_id);
                        const colorClass = matchInfo ? matchInfo.colorClass : 'text-brand-accent';
                        const bgColorClass = colorClass.replace('text-', 'bg-');

                        return (
                            <div key={match.rank} className="p-3 bg-gray-800 rounded-lg flex items-center gap-3">
                                <span className="font-bold text-base w-1/3 truncate" title={language === 'ko' ? match.snack_name : matchInfo?.snack_en || match.snack_name}>
                                    {match.rank}. {language === 'ko' ? match.snack_name : matchInfo?.snack_en || match.snack_name}
                                </span>
                                <div className="flex-grow">
                                    <ProgressBar percentage={match.match_score_percent} colorClass={bgColorClass} />
                                </div>
                                <span className="font-mono text-base font-semibold text-brand-accent w-14 text-right">
                                    {match.match_score_percent}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500 url-display-container">
            <p>{window.location.href}</p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4 share-buttons-container">
            <button 
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
            >
                <ResetIcon className="w-5 h-5" />
                {language === 'ko' ? '다시하기' : 'Try Again'}
            </button>
            <button 
                onClick={handleShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-pink-600 transition-colors disabled:bg-pink-800 disabled:cursor-not-allowed"
            >
                {isSharing ? <SpinnerIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
                {isSharing 
                    ? (language === 'ko' ? '공유 준비 중...' : 'Preparing Share...') 
                    : (language === 'ko' ? '결과 공유하기' : 'Share Result')}
            </button>
        </div>
    </div>
  );
};
