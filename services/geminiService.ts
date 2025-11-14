
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const K_SNACK_DEFINITIONS = `
| 분류 ID | K-과자 유형 (Vibe) | 대표 K-과자 | 매칭 K-스타 3인 (같은 유형 연예인) | 유형 정의 (AI 분석 기준) |
| :--- | :--- | :--- | :--- | :--- |
| **A** | 강렬한 중독성 | 매운 새우깡 | (여자)아이들 소연, 현아, BTS 정국 | 한번 빠지면 헤어날 수 없는 마성의 매력. 시선이 닿는 순간 주변을 압도하는 강력한 포스와 독보적인 카리스마. |
| **B** | 부드럽고 달콤함 | 허니버터칩 | 박보검, 아이유, NCT 재현 | 보는 이에게 힐링을 선사하는 천상의 미소. 맑고 따뜻함을 잃지 않는 부드러운 분위기, 누구나 기댈 수 있는 편안함과 달콤함. |
| **C** | 새콤 톡톡 개성파 | 자유시간 | 세븐틴 부승관, 이영지, 이광수 | 예측 불가능한 유쾌함. 틀에 갇히지 않은 톡톡 튀는 아이디어와 넘치는 에너지. 지루할 틈 없이 주변을 즐겁게 하는 독특한 존재감. |
| **D** | 균형 잡힌 클래식함 | 새우깡 | 이정재, 김혜수, 엑소 수호 | 시간이 지나도 변치 않는 정석적인 아름다움과 안정감. 겉은 차분하지만 깊이 있는 신뢰감과 기품이 느껴져 언제나 호감을 주는 타입. |
| **E** | 깊고 복합적인 풍미 | 꼬북칩 | 김태리, 유아인, BTS RM | 쉽게 정의할 수 없는 오묘한 매력. 겉모습보다 내면에 더 많은 이야기와 깊이를 품고 있어, 알면 알수록 새로운 복합적인 풍미. |
| **F** | 바삭! 경쾌한 활동성 | 포카칩 | 아이브 장원영, 배우 최우식, TXT 수빈 | 맑고 밝은 기운을 전달하는 트렌디세터. 활기차고 당당한 모습으로 시선을 사로잡으며, 등장하는 순간 분위기는 생기로 가득 차 오름. |
| **G** | 쫀득! 끈기 있는 노력형 | 마이쮸 | 유노윤호, 김연아, 배우 조정석 | 포기하지 않는 단단한 끈기와 집중력. 목표를 향해 묵묵히 나아가는 모습에서 프로페셔널한 아우라가 느껴지며, 함께 하는 사람들에게 믿음을 줌. |
| **H** | 촉촉한 반전 매력 | 초코파이 | 차은우, 김선호, 아이유 | 겉과 속이 다른 반전의 매력. 차가워 보이던 인상 뒤에 숨겨진 따뜻하고 감성적인 면모가 예상치 못한 순간에 큰 감동을 선사함. |
| **I** | 달콤 쌉쌀한 성숙미 | 빈츠 | 공유, 전지현, 엑소 카이 | 삶의 깊이가 느껴지는 성숙하고 우아한 분위기. 낭만적이지만 절제된 지적인 매력이 돋보이며, 커피 같은 깊은 여운을 남김. |
| **J** | 든든한 포용력 | 오징어땅콩 | 유재석, 마동석, 송중기 | 모두를 아우르는 넓고 넉넉한 마음을 지닌 리더형 인상. 힘들 때 기댈 수 있는 편안하고 든든한 존재감으로, 안정과 활력을 동시에 제공함. |
`;

const PROMPT = `
당신은 Ksnackface 프로젝트를 위한 AI 기반의 K-과자 유형 분석 전문가입니다.
사용자가 제공한 얼굴 사진을 분석하여, 그 인상(분위기, 표정, 이목구비의 조화)이 아래 정의된 10가지 'K-과자 유형' 중 가장 가까운 하나(1위)를 선택하고, 상위 3개 유형의 분석 결과를 제공해야 합니다.

### K-과자 유형 정의:
${K_SNACK_DEFINITIONS}

### 분석 및 출력 규칙:
1.  **유형 분류**: 분석된 인상은 반드시 위 표의 '분류 ID (A-J)' 중 상위 3개를 선정해야 합니다.
2.  **일치도 계산 (중요)**: 상위 3개 유형의 일치도를 백분율(%)로 계산합니다. 세 유형의 일치도 합계는 100%가 되어야 합니다. 1위 유형의 일치도는 반드시 **70% 이상**이 되도록 가중치를 부여하고, 나머지 점수를 2위와 3위에 자연스럽게 분배하세요 (예: 1위 75%, 2위 15%, 3위 10%).
3.  **K-스타 연결**: 1위 유형에 해당하는 '매칭 K-스타 3인'을 'all_matched_kstars' 필드에 포함합니다.
4.  **유형 설명 생성**: 1위 유형을 기준으로, 사진 속 인물의 특징과 K-과자 유형 정의를 연결하여 구체적인 이유를 작성합니다. '사진 속 당신은...'과 같이 사진을 직접 묘사하는 문장은 피하고, 전체적인 인상과 분위기에 초점을 맞추세요. **이 설명에는 '매칭 K-스타'의 이름이 포함되어서는 안 됩니다.** 'kstar_match_reason_kr' 필드에는 한국어로 3문장 이내, 'kstar_match_reason_en' 필드에는 영어로 3문장 이내로, 간결하고 공유하기 좋게 작성하십시오.
5.  **출력 형식**: 반드시 지정된 JSON 스키마에 따라 단일 JSON 객체만 반환해야 합니다. 다른 설명 텍스트는 일절 포함하지 마세요.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        primary_match_id: { type: Type.STRING, description: "A-J 중 가장 높은 일치도를 가진 1위 분류 ID" },
        all_matched_kstars: { type: Type.STRING, description: "1위 유형에 해당하는 K-스타 3인 목록 (쉼표로 구분)" },
        kstar_match_reason_kr: { type: Type.STRING, description: "1위 유형을 기준으로 당신의 인상과 K-스타 유형 이미지가 연결되는 구체적인 이유 (한국어 3문장 이내)" },
        kstar_match_reason_en: { type: Type.STRING, description: "The specific reason connecting your impression with the K-star type image based on the #1 type (in English, within 3 sentences)" },
        top_3_matches: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    rank: { type: Type.INTEGER },
                    match_id: { type: Type.STRING },
                    snack_name: { type: Type.STRING },
                    vibe_keyword_kr: { type: Type.STRING },
                    vibe_keyword_en: { type: Type.STRING },
                    match_score_percent: { type: Type.INTEGER },
                },
                required: ['rank', 'match_id', 'snack_name', 'vibe_keyword_kr', 'match_score_percent']
            }
        }
    },
    required: ['primary_match_id', 'all_matched_kstars', 'kstar_match_reason_kr', 'kstar_match_reason_en', 'top_3_matches']
};


export const analyzeKsnackFace = async (base64Image: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: PROMPT,
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
    }
  });

  const jsonString = response.text.trim();
  const result = JSON.parse(jsonString);

  // Validate that top_3_matches exists and is an array
  if (!result.top_3_matches || !Array.isArray(result.top_3_matches)) {
    throw new Error("Invalid response format from API: missing top_3_matches");
  }

  // Sort by rank just in case the API doesn't
  result.top_3_matches.sort((a: any, b: any) => a.rank - b.rank);

  return result as AnalysisResult;
};
