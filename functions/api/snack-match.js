// functions/api/snack-match.js

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return new Response('GEMINI_API_KEY is not set in environment variables.', { status: 500 });
    }

    try {
        // 프론트엔드에서 Base64 인코딩된 이미지 문자열을 JSON 형태로 전송한다고 가정
        const requestData = await request.json();
        const base64Image = requestData.image; // 'data:image/jpeg;base64,...' 형식
        
        if (!base64Image) {
            return new Response('Missing image data in request body.', { status: 400 });
        }

        // Base64 문자열에서 MIME 타입과 데이터 부분 분리
        const [mimePart, dataPart] = base64Image.split(';base64,');
        const mimeType = mimePart.split(':')[1];
        
        // --- 🤖 최종 상세 프롬프트 (System Instruction) ---
        const systemInstruction = `
당신은 Ksnackface 프로젝트를 위한 AI 기반의 K-과자 유형 분석 전문가입니다.
사용자가 제공한 얼굴 사진을 분석하여, 그 인상(분위기, 표정, 이목구비의 조화)이 아래 정의된 10가지 'K-과자 유형' 중 **가장 가까운 하나(1위)**를 선택하고, **상위 3개 유형**의 분석 결과를 제공해야 합니다.

### Ksnackface 디자인 및 처리 지침:
1.  **UI/UX 구조:**
    * **화면:** 홈페이지 스타일의 상단 고정 바가 있으며, 초기 화면 없이 **단일 화면에서 아래 방향으로 결과가 즉시 제시**됩니다.
    * **이미지:** 사용자의 입력 사진은 **크기 변경 없이** 결과 이미지로 활용되며, 사진 영역 크기는 항상 변화가 없습니다.
    * **제목:** 상단 고정 바 좌측에 표시되는 테스트 제목은 **국문 'K-과자 유형 테스트', 영문 'K-snack face test'** 입니다.
2.  **데이터 목표:** 최종 공유 페이지는 1위 결과 외 상위 3개 유형의 순위와 점수를 표시해야 합니다. 당신이 생성하는 JSON 데이터는 이 모든 핵심 정보를 완벽하게 제공해야 합니다.
3.  **언어 및 스타일:** 다크 모드 디자인에 맞게 시크하고 깔끔한 톤을 유지하며, 출력은 한국어를 기본으로 합니다.

### 역할 및 출력 조건:
1.  **유형 분류**: 분석된 인상은 반드시 아래 표의 **'분류 ID (A-J)' 중 상위 3개**를 선정해야 합니다.
2.  **일치도 계산 (중요)**: 상위 3개 유형 각각에 대한 **일치도(정수 백분율)**를 계산합니다. **결과의 신뢰성을 높이기 위해 1위, 2위, 3위 간의 점수 격차를 10% 이상** 두어야 합니다 (예: 85, 70, 55).
3.  **K-스타 연결**: **1위 유형**에 해당하는 **'매칭 K-스타 3인'**을 \`all_matched_kstars\` 필드에 포함합니다.
4.  **유형 설명 생성**: **1위 유형**을 기준으로 유형 설명을 생성하여 \`kstar_match_reason_kr\` 필드에 기입합니다. **(아래 '유형 정의' 항목을 참고하여 사용자의 사진과 연결하십시오.)**
5.  **출력 형식**: 다음 구조를 가진 **단일 JSON 객체**만 반환해야 하며, 다른 설명 텍스트는 일절 포함하지 마세요.

### JSON Schema (구조 간소화):
{
  "primary_match_id": "A-J 중 가장 높은 일치도를 가진 1위 분류 ID",
  "all_matched_kstars": "1위 유형에 해당하는 K-스타 3인 목록 (쉼표로 구분)",
  "kstar_match_reason_kr": "1위 유형을 기준으로 당신의 인상과 K-스타 유형 이미지가 연결되는 구체적인 이유 (한국어 3문장 이내, 간결하고 공유하기 좋게 작성)",
  "top_3_matches": [
    {
      "rank": 1,
      "match_id": "A-J 분류 ID (1위)",
      "snack_name": "대표 K-과자 이름 (1위)",
      "vibe_keyword_kr": "K-과자 유형 (1위)",
      "vibe_keyword_en": "K-snack type (1위)",
      "match_score_percent": "일치도 (정수 백분율)"
    },
    {
      "rank": 2,
      "match_id": "A-J 분류 ID (2위)",
      "snack_name": "대표 K-과자 이름 (2위)",
      "vibe_keyword_kr": "K-과자 유형 (2위)",
      "match_score_percent": "일치도 (정수 백분율)"
    },
    {
      "rank": 3,
      "match_id": "A-J 분류 ID (3위)",
      "snack_name": "대표 K-과자 이름 (3위)",
      "vibe_keyword_kr": "K-과자 유형 (3위)",
      "match_score_percent": "일치도 (정수 백분율)"
    }
  ]
}

### 📋 K-스타 매칭 기준 테이블 및 유형 정의:
분석 후, 다음 표의 정보를 활용하여 유형 분류 및 매칭 정보를 결정해야 합니다. **'유형 정의' 항목은 AI가 분석의 근거로 사용하는 핵심 개념입니다.**

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

### 최종 지시:
분석 결과를 바탕으로 모든 JSON 필드를 채우십시오. **상위 3개의 유형을 순위(1, 2, 3위) 및 일치도와 함께 \`top_3_matches\` 배열에 정확히 반영**해야 합니다.
`;
        // ----------------------------------------------------

        const payload = {
            contents: [
                {
                    parts: [
                        { text: systemInstruction }, // 시스템 프롬프트
                        {
                            inlineData: {
                                data: dataPart, // Base64 인코딩된 이미지 데이터
                                mimeType: mimeType
                            }
                        },
                        { text: "사용자의 사진을 분석하여 위의 지침과 JSON Schema에 따라 결과를 출력해주세요." } // 사용자 요청
                    ]
                }
            ],
            config: {
                // 모델이 JSON 형식으로 응답하도록 설정
                responseMimeType: "application/json", 
                // Gemini-2.5-Flash는 빠른 응답 속도와 멀티모달 능력 제공
                model: 'gemini-2.5-flash', 
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Gemini API Error:', response.statusText);
            return new Response(`Gemini API request failed: ${response.statusText}`, { status: response.status });
        }

        const jsonResponse = await response.json();

        // Gemini의 응답에서 텍스트 부분을 추출하여 JSON으로 파싱
        const jsonString = jsonResponse.candidates[0].content.parts[0].text;
        const resultJson = JSON.parse(jsonString);

        // 결과 JSON 반환
        return new Response(JSON.stringify(resultJson), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        console.error('Function Error:', e);
        return new Response(`Internal Server Error: ${e.message}`, { status: 500 });
    }
}