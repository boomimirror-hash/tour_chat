# 관광 패키지 추천 서비스

AI 대화형 취향 탐색 + 빅데이터 기반 관광 패키지 추천 웹 서비스.

## 프로젝트 구조

```
/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/             # 인증 관련 라우트
│   ├── (main)/             # 메인 서비스 라우트
│   │   ├── chat/           # AI 취향 탐색 대화
│   │   ├── packages/       # 패키지 목록·상세
│   │   └── my/             # 마이페이지
│   ├── api/                # API Route Handlers
│   │   ├── chat/           # Claude API 연동
│   │   ├── tourism/        # 관광공사 API 연동
│   │   └── packages/       # 패키지 생성·조회
│   ├── layout.tsx
│   └── page.tsx
├── components/             # 공통 UI 컴포넌트
│   ├── ui/                 # shadcn/ui 기본 컴포넌트
│   ├── chat/               # 대화 UI 컴포넌트
│   └── package/            # 패키지 카드·목록 컴포넌트
├── lib/                    # 유틸·서비스 레이어
│   ├── supabase/           # Supabase 클라이언트·타입
│   ├── tourism-api/        # 관광공사 API 클라이언트
│   └── claude/             # Claude API 클라이언트
├── types/                  # TypeScript 타입 정의
├── docs/                   # 프로젝트 문서
└── public/
```

## 기술 스택

- **프레임워크**: Next.js 14 (App Router) + TypeScript
- **DB / Auth**: Supabase
- **스타일**: Tailwind CSS + shadcn/ui
- **배포**: Vercel
- **AI**: Gemini API (Google)

## 외부 API

| API | 용도 |
|-----|------|
| 한국관광공사 국문 관광정보 서비스 | 관광지·숙박·캠핑 기본 데이터 |
| 고캠핑 API | 캠핑·글램핑 상세 정보 |
| 관광 빅데이터 API | 이번 달 급상승 지역 감지 |
| 관광지 집중률 예측 API | 혼잡도 회피 날짜 선정 |
| 반려동물 동반여행 API | 반려동물 동반 가능 시설 필터 |
| 웰니스관광정보 API | 힐링·웰니스 관광 데이터 |
| 연관 관광지 정보 API | 관광지 기반 연관 추천 |

## 개발 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run typecheck # TypeScript 타입 검사
```

## 환경 변수

`.env.local` 파일에 설정:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
TOURINFO_API_KEY=      # 한국관광공사 국문 관광정보 서비스 (공통 키)
CAMPING_API_KEY=       # 고캠핑 API
BIGDATA_API_KEY=       # 관광 빅데이터 API
CONGESTION_API_KEY=    # 관광지 집중률 예측 API
PET_API_KEY=           # 반려동물 동반여행 API
WELLNESS_API_KEY=      # 웰니스관광정보 API
SIMILAR_API_KEY=       # 연관 관광지 정보 API
CRON_SECRET=
```

## 코딩 규칙

- 컴포넌트는 `app/` 하위 page.tsx에서 Server Component 기본 사용, 인터랙션 필요 시 `"use client"` 명시
- API Route Handler는 `app/api/` 에만 위치
- 외부 API 호출은 반드시 `lib/` 레이어를 통해서만 수행 (컴포넌트 직접 호출 금지)
- 타입은 `types/` 에 중앙 관리
- shadcn/ui 컴포넌트 우선 사용, 커스텀 필요 시 `components/ui/` 확장
- 에러 처리: 외부 API 실패 시 빈 배열·null 반환 (앱 크래시 방지)
- 주석은 WHY가 비명확한 경우에만 한국어로 작성

## 핵심 플로우

1. **취향 탐색**: 사용자 ↔ Claude AI 짧은 대화로 여행 선호도 파악
2. **트렌드 감지**: 관광 빅데이터 API로 이번 달 급상승 관광지 추출
3. **패키지 생성**: 혼잡도 예측 API로 최적 날짜 + 취향 맞춤 숙박·관광지 조합 자동 생성
