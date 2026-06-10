# 개발 태스크 목록

> 상태: `[ ]` 미시작 · `[~]` 진행 중 · `[x]` 완료

---

## Phase 0. 프로젝트 초기 세팅

- [x] P0-01 `npx create-next-app@latest` — TypeScript, App Router, Tailwind 설정
- [x] P0-02 shadcn/ui 초기화 (`npx shadcn-ui@latest init`)
- [x] P0-03 `.env.local` 파일 생성 및 API 키 항목 정의
- [x] P0-04 Supabase 프로젝트 생성 + 환경 변수 연결
- [x] P0-05 Vercel 프로젝트 생성 + GitHub 연동 + 환경 변수 등록
- [x] P0-06 ESLint / Prettier 설정 통일

---

## Phase 1. DB 스키마 & 인증

- [x] P1-01 Supabase `profiles` 테이블 생성 + RLS 정책 적용
- [x] P1-02 `preference_profiles` 테이블 생성 + RLS 정책 적용
- [x] P1-03 `trending_spots` 테이블 생성
- [x] P1-04 `packages` 테이블 생성 + RLS 정책 적용
- [x] P1-05 `bookmarks` 테이블 생성 + RLS 정책 적용
- [x] P1-06 Supabase CLI로 타입 자동 생성 → `lib/supabase/types.ts`
- [x] P1-07 `lib/supabase/client.ts` (브라우저용) 작성
- [x] P1-08 `lib/supabase/server.ts` (서버용, cookies) 작성
- [x] P1-09 이메일 + 비밀번호 회원가입 페이지 (`app/(auth)/signup`)
- [x] P1-10 로그인 페이지 (`app/(auth)/login`)
- [x] P1-11 Google 소셜 로그인 연동
- [x] P1-12 Kakao 소셜 로그인 연동
- [x] P1-13 비밀번호 재설정 이메일 발송
- [x] P1-14 미들웨어 — 비로그인 시 `/chat`, `/packages`, `/my` 접근 차단

---

## Phase 2. 외부 API 클라이언트 구현

- [x] P2-01 `lib/tourism-api/tour.ts` — TourAPI 4.0 관광지 검색
- [x] P2-02 `lib/tourism-api/tour.ts` — TourAPI 4.0 숙박 검색
- [x] P2-03 `lib/tourism-api/camping.ts` — 고캠핑 API 클라이언트
- [x] P2-04 `lib/tourism-api/bigdata.ts` — 관광 빅데이터 급상승 지역 조회
- [x] P2-05 `lib/tourism-api/congestion.ts` — 관광지 집중률 예측 조회
- [x] P2-06 `lib/tourism-api/pet.ts` — 반려동물 동반여행 시설 조회
- [x] P2-07 `lib/tourism-api/wellness.ts` — 웰니스관광정보 조회
- [x] P2-08 각 클라이언트 응답 타입 → `types/api.ts` 정의
- [x] P2-09 API 호출 실패 시 `null` / 빈 배열 반환 처리 (전 클라이언트 공통)

---

## Phase 3. 트렌드 데이터 캐싱 & Cron

- [x] P3-01 `GET /api/tourism/trending` Route Handler 구현
- [x] P3-02 `CRON_SECRET` 헤더 검증 미들웨어 적용
- [x] P3-03 빅데이터 API → `trending_spots` upsert 로직 구현
- [x] P3-04 `vercel.json` Cron 설정 (매일 02:00 KST)
- [x] P3-05 갱신 실패 시 기존 데이터 유지 + 서버 로그 기록 확인

---

## Phase 4. AI 취향 탐색 대화

- [x] P4-01 `lib/gemini/client.ts` — Gemini API 스트리밍 호출 함수 작성
- [x] P4-02 취향 수집용 system prompt 작성 (7개 항목, 완료 시 JSON 시그널)
- [x] P4-03 `POST /api/chat` Route Handler — 스트리밍 응답
- [x] P4-04 `components/chat/ChatWindow.tsx` — 대화 컨테이너
- [x] P4-05 `components/chat/MessageBubble.tsx` — 사용자·AI 말풍선
- [x] P4-06 `components/chat/ChatInput.tsx` — 입력창 + 전송 버튼
- [x] P4-07 스트리밍 텍스트 실시간 렌더링 구현
- [x] P4-08 Gemini 완료 시그널 감지 → preference JSON 파싱
- [x] P4-09 파싱된 preference → `preference_profiles` DB 저장
- [x] P4-10 기존 프로필 보유 회원 — "이전 취향으로 추천 / 다시 탐색" 분기 UI
- [x] P4-11 `app/(main)/chat/page.tsx` 완성

---

## Phase 5. 패키지 생성 파이프라인

- [x] P5-01 `lib/package-builder.ts` — 취향 × 트렌드 매칭 로직
- [x] P5-02 집중률 예측으로 추천 날짜 3개 선정 로직
- [x] P5-03 관광지 + 숙박 + 날짜 조합 → 패키지 5개 생성 로직
- [x] P5-04 반려동물 필터 분기 처리
- [x] P5-05 캠핑·글램핑 필터 분기 처리
- [x] P5-06 웰니스 데이터 포함 분기 처리
- [x] P5-07 `Promise.allSettled` 병렬 호출 + 부분 실패 허용 처리
- [x] P5-08 `POST /api/packages` Route Handler 구현
- [x] P5-09 생성된 패키지 → `packages` 테이블 저장
- [ ] P5-10 응답 시간 측정 — 10초 초과 시 원인 분석 및 최적화

---

## Phase 6. 패키지 조회 UI

- [x] P6-01 `types/package.ts` — TourPackage, TourSpot, Accommodation, RecommendedDate 타입 정의
- [x] P6-02 `components/package/PackageCard.tsx` — 목록용 카드 (썸네일·관광지명·날짜·혼잡도)
- [x] P6-03 `components/package/CongestionCalendar.tsx` — 혼잡도 달력
- [x] P6-04 `components/package/BookmarkButton.tsx` — 북마크 토글
- [x] P6-05 `components/package/PackageDetail.tsx` — 상세 뷰
- [ ] P6-06 지도 연동 (카카오맵 또는 네이버지도) — 관광지 핀 표시
- [x] P6-07 `GET /api/packages/[id]` Route Handler
- [x] P6-08 `POST /api/packages/[id]/bookmark` Route Handler
- [x] P6-09 `app/(main)/packages/page.tsx` — 패키지 목록 페이지
- [x] P6-10 `app/(main)/packages/[id]/page.tsx` — 패키지 상세 페이지
- [x] P6-11 비회원 접근 시 로그인 리다이렉트 처리

---

## Phase 7. 마이페이지

- [x] P7-01 `GET /api/packages` (북마크 목록) Route Handler
- [x] P7-02 `app/(main)/my/page.tsx` — 저장 패키지 목록 + 삭제

---

## Phase 8. 랜딩 페이지

- [x] P8-01 `app/(main)/page.tsx` — 서비스 소개 + CTA 버튼
- [x] P8-02 비회원 AI 대화 체험 플로우 연결

---

## Phase 9. 품질 & 배포

- [ ] P9-01 모바일(360px) / 태블릿(768px) / 데스크탑(1280px) 반응형 점검
- [ ] P9-02 핵심 페이지 LCP 측정 — 3초 초과 항목 개선
- [x] P9-03 Next.js `fetch` revalidate 설정으로 중복 API 호출 최소화
- [ ] P9-04 Supabase RLS 전 테이블 동작 검증
- [ ] P9-05 `/api/chat` Rate Limiting 미들웨어 적용 (1분 10회)
- [ ] P9-06 환경 변수 누락 체크 스크립트 작성
- [ ] P9-07 Vercel 프로덕션 배포 + 도메인 연결
- [ ] P9-08 Cron 실제 동작 확인 (Vercel 로그)
- [ ] P9-09 주요 플로우 E2E 수동 테스트 (대화 → 패키지 생성 → 북마크)

---

## 의존성 순서 요약

```
Phase 0 (세팅)
    └─ Phase 1 (DB·인증)
          ├─ Phase 2 (외부 API 클라이언트)
          │     ├─ Phase 3 (Cron 캐싱)
          │     ├─ Phase 4 (AI 대화)  ──┐
          │     └─ Phase 5 (패키지 생성) ◄─ Phase 4 완료 후
          │           └─ Phase 6 (조회 UI)
          │                 └─ Phase 7 (마이페이지)
          └─ Phase 8 (랜딩)
                └─ Phase 9 (품질·배포)  ◄─ 전 Phase 완료 후
```
