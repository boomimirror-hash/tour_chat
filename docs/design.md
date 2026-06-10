# 시스템 설계 문서

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│         Next.js App Router (RSC + Client)           │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────┐
│                  Vercel Edge / Node.js               │
│              Next.js API Route Handlers              │
│   /api/chat   /api/tourism   /api/packages          │
└──────┬─────────────┬──────────────┬─────────────────┘
       │             │              │
  Gemini API    Supabase DB    관광공사 외부 API 군
  (취향 대화)   (DB + Auth)   (관광정보, 빅데이터 등)
```

**핵심 원칙**
- 외부 API 키는 서버에서만 사용 — 클라이언트에 절대 노출 금지
- 외부 API 호출은 모두 `lib/` 레이어에서 추상화
- 트렌드 데이터는 Supabase에 캐싱하여 사용자 요청마다 외부 호출 방지

---

## 2. 디렉토리 구조 상세

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (main)/
│   ├── layout.tsx               # 헤더·네비게이션
│   ├── page.tsx                 # 랜딩 페이지
│   ├── chat/
│   │   └── page.tsx             # AI 취향 탐색 대화
│   ├── packages/
│   │   ├── page.tsx             # 패키지 목록
│   │   └── [id]/page.tsx        # 패키지 상세
│   └── my/
│       └── page.tsx             # 마이페이지 (저장 패키지)
├── api/
│   ├── chat/route.ts            # Gemini 스트리밍 엔드포인트
│   ├── tourism/
│   │   ├── trending/route.ts    # 빅데이터 트렌드 조회
│   │   └── spots/route.ts       # 관광지 검색
│   └── packages/
│       ├── route.ts             # 패키지 생성 (POST) · 목록 (GET)
│       └── [id]/route.ts        # 패키지 상세 · 북마크
│
lib/
├── supabase/
│   ├── client.ts                # 브라우저용 클라이언트
│   ├── server.ts                # 서버용 클라이언트 (cookies)
│   └── types.ts                 # DB 테이블 타입 (자동 생성)
├── gemini/
│   └── client.ts                # Gemini API 호출·프롬프트
├── tourism-api/
│   ├── tour.ts                  # 한국관광공사 국문 관광정보 (관광지·숙박)
│   ├── camping.ts               # 고캠핑 API
│   ├── bigdata.ts               # 관광 빅데이터 API
│   ├── congestion.ts            # 집중률 예측 API
│   ├── pet.ts                   # 반려동물 동반여행 API
│   ├── wellness.ts              # 웰니스관광정보 API
│   └── similar.ts               # 연관 관광지 정보 API
└── package-builder.ts           # 패키지 조합 로직

components/
├── ui/                          # shadcn/ui 기본 (Button, Card 등)
├── chat/
│   ├── ChatWindow.tsx           # 대화 전체 컨테이너
│   ├── MessageBubble.tsx        # 메시지 말풍선
│   └── ChatInput.tsx            # 입력창
└── package/
    ├── PackageCard.tsx          # 목록용 카드
    ├── PackageDetail.tsx        # 상세 뷰
    ├── CongestionCalendar.tsx   # 혼잡도 달력
    └── BookmarkButton.tsx       # 북마크 토글

types/
├── preference.ts                # 취향 프로필 타입
├── package.ts                   # 패키지·관광지·숙박 타입
└── api.ts                       # 외부 API 응답 타입
```

---

## 3. DB 스키마 (Supabase)

### `profiles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users.id 참조 |
| updated_at | timestamptz | |

### `preference_profiles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles.id) | |
| companion_type | text | solo · couple · family · friends |
| nature_preference | text[] | mountain · sea · forest · rural |
| activity_level | text | low · medium · high |
| avoid_crowd | boolean | |
| has_pet | boolean | |
| prefer_wellness | boolean | |
| prefer_camping | boolean | |
| raw_chat | jsonb | 대화 전체 내용 (Gemini 메시지 배열) |
| created_at | timestamptz | |

### `trending_spots` (캐싱 테이블)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| area_code | text | 관광공사 지역 코드 |
| area_name | text | |
| rank | int | 이번 달 급상승 순위 |
| fetched_at | timestamptz | 마지막 갱신 시각 |

### `packages`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles.id) | |
| preference_id | uuid (FK → preference_profiles.id) | |
| spots | jsonb | 관광지 배열 |
| accommodations | jsonb | 숙박 옵션 배열 |
| recommended_dates | jsonb | 추천 날짜 + 혼잡도 점수 배열 |
| created_at | timestamptz | |

### `bookmarks`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles.id) | |
| package_id | uuid (FK → packages.id) | |
| created_at | timestamptz | |

**RLS 정책**: 모든 테이블에 `auth.uid() = user_id` 조건 적용

---

## 4. 핵심 플로우 설계

### 4.1 AI 취향 탐색 대화

```
사용자 접속
    │
    ▼
기존 preference_profile 존재?
    ├─ YES → "이전 취향으로 추천" / "다시 탐색" 선택
    └─ NO  → 대화 시작
               │
               ▼
         POST /api/chat  (메시지 배열 전송)
               │
               ▼
         Gemini API (스트리밍)
         system prompt: 취향 수집 지침 + 현재까지 수집된 항목
               │
               ▼
         스트리밍 응답 → ChatWindow에 실시간 표시
               │
         Gemini가 "취향 파악 완료" 시그널 반환 시
               │
               ▼
         preference_profile DB 저장
               │
               ▼
         패키지 생성 시작
```

**Gemini system prompt 구조**
```
역할: 친근한 여행 플래너
목표: 7개 취향 항목을 자연스러운 대화로 수집
규칙:
  - 한 번에 한 가지만 질문
  - 수집 완료 시 JSON 블록으로 preference 반환
  - 수집 항목: companion_type, nature_preference, activity_level,
               avoid_crowd, has_pet, prefer_wellness, prefer_camping
```

### 4.2 패키지 생성 파이프라인

```
POST /api/packages
    │
    ├─① trending_spots 테이블 조회 (캐싱 데이터)
    │
    ├─② 취향 × 트렌드 매칭
    │     예) has_pet=true → 반려동물 API로 동반 가능 시설 필터
    │         prefer_camping=true → 고캠핑 API 우선 조회
    │
    ├─③ 집중률 예측 API: 향후 30일 중 혼잡도 하위 날짜 3개 선정
    │
    ├─④ TourAPI: 선정 관광지 상세 + 인근 숙박 조회
    │
    ├─⑤ package-builder.ts: 관광지 + 숙박 + 날짜 조합 → 패키지 5개
    │
    └─⑥ packages 테이블 저장 → 클라이언트 반환

병렬 처리: ③④는 Promise.allSettled로 동시 호출
실패 허용: allSettled 사용으로 일부 API 실패 시에도 부분 패키지 생성
```

### 4.3 트렌드 데이터 갱신 (Cron)

```
Vercel Cron (매일 02:00 KST)
    │
    ▼
GET /api/tourism/trending  (cron secret 헤더 검증)
    │
    ▼
관광 빅데이터 API 호출
    │
    ├─ 성공 → trending_spots 테이블 upsert
    └─ 실패 → 기존 데이터 유지 + 서버 로그 기록
```

---

## 5. API Route 설계

### `POST /api/chat`
```typescript
// Request
{ messages: { role: 'user' | 'assistant', content: string }[] }

// Response: SSE 스트리밍
// 마지막 청크에 preference JSON 포함 (취향 수집 완료 시)
```

### `POST /api/packages`
```typescript
// Request
{ preferenceId: string }

// Response
{
  packages: Package[]  // 최대 5개
}
```

### `GET /api/packages/[id]`
```typescript
// Response
{
  package: Package,
  isBookmarked: boolean
}
```

### `POST /api/packages/[id]/bookmark`
```typescript
// Response
{ bookmarked: boolean }
```

---

## 6. 주요 타입 정의

```typescript
// types/preference.ts
interface PreferenceProfile {
  id: string
  companionType: 'solo' | 'couple' | 'family' | 'friends'
  naturePreference: ('mountain' | 'sea' | 'forest' | 'rural')[]
  activityLevel: 'low' | 'medium' | 'high'
  avoidCrowd: boolean
  hasPet: boolean
  preferWellness: boolean
  preferCamping: boolean
}

// types/package.ts
interface TourPackage {
  id: string
  spots: TourSpot[]
  accommodations: Accommodation[]
  recommendedDates: RecommendedDate[]
}

interface TourSpot {
  contentId: string
  title: string
  address: string
  imageUrl: string
  category: string
  mapX: number
  mapY: number
}

interface Accommodation {
  contentId: string
  title: string
  type: 'hotel' | 'pension' | 'camping' | 'glamping'
  address: string
  imageUrl: string
  petFriendly: boolean
}

interface RecommendedDate {
  date: string          // YYYY-MM-DD
  congestionScore: number  // 0~100, 낮을수록 여유
  label: '매우 여유' | '여유' | '보통'
}
```

---

## 7. 상태 관리 전략

- **서버 상태**: 패키지·트렌드 데이터는 React Server Component에서 직접 fetch
- **클라이언트 상태**: 대화 메시지 배열은 `useState`로 관리 (채팅 컴포넌트)
- **전역 상태**: 로그인 세션만 Supabase 클라이언트가 자동 관리 — 별도 전역 상태 라이브러리 미사용
- **캐싱**: Next.js `fetch` 캐싱 + `revalidate` 설정으로 반복 API 호출 최소화

---

## 8. 보안 고려사항

| 항목 | 대응 |
|------|------|
| API 키 노출 | 모든 외부 API 호출은 서버(Route Handler)에서만 수행 |
| 사용자 데이터 격리 | Supabase RLS — `auth.uid() = user_id` 조건 전 테이블 적용 |
| Cron 엔드포인트 보호 | `CRON_SECRET` 헤더 검증, 미일치 시 401 반환 |
| Gemini 프롬프트 인젝션 | 사용자 입력을 `user` role 메시지로만 전달, system prompt 분리 |
| Rate Limiting | Vercel 기본 제공 + `/api/chat` 1분 10회 제한 (미들웨어) |
