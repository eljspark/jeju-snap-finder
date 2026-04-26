# Supabase Migration Guide

이 문서는 현재 Supabase 기반 백엔드를 다른 플랫폼(예: Firebase, AWS Amplify, PlanetScale + Cloudflare R2, Appwrite, Pocketbase, Neon + Cloudflare R2 등)으로 마이그레이션하기 위해 필요한 모든 정보를 정리합니다. Claude나 다른 AI 코딩 도구가 이 문서만 보고도 마이그레이션 작업을 수행할 수 있도록 작성되었습니다.

---

## 1. 프로젝트 개요

- **프로젝트 이름**: jeju-snap-finder
- **스택**: React 18 + Vite 5 + TypeScript 5 + Tailwind CSS v3 + shadcn/ui
- **렌더링**: vite-plugin-ssr 기반의 SSG (Static Site Generation), 빌드 시점에 Supabase 데이터 fetch
- **현재 배포 URL**: https://jeju-snap-finder.lovable.app
- **현재 백엔드**: Supabase (Project ref: `cvuirhzznizztbtclieu`)

### 백엔드가 제공하는 기능
1. **Database (Postgres)** — 패키지 정보, 예약 클릭 분석, 사용자 피드백 저장
2. **Storage** — 패키지 샘플 이미지 호스팅 (`packages` 버킷, public)
3. **Image Transformations** — 이미지 리사이징 / 품질 조절 (`/storage/v1/render/image/public/`)
4. **Auth** — **현재 사용하지 않음** (어드민 페이지가 공개되어 있음, 마이그레이션 시 보안 강화 권장)
5. **RLS** — public read/write 정책으로 모든 작업이 anon key로 가능

---

## 2. 데이터베이스 스키마

### 2.1 Enums

```sql
CREATE TYPE occasion_enum AS ENUM (
  '커플', '가족', '우정', '프로필', '웨딩', '만삭', '개인', '아기'
);

CREATE TYPE mood_enum AS ENUM (
  '로맨틱', '자연스러운', '밝은', '감성적인', '따뜻한', '청량한', '모던한',
  '빈티지', '편안한', '활기찬', '차분한', '몽환적인', '고요한', '순수한',
  '깨끗한', '아날로그', '일본감성', '청춘만화', '여유로운', '맑은', '상쾌한',
  '평화로운', '힐링되는', '일상적인', '소박한', '담백한', '친근한', '포근한',
  '화사한', '싱그러운', '목가적인', '청춘 같은', '로맨틱한', '사랑스러운',
  '생기 있는', '경쾌한', '투명한'
);
```

### 2.2 Tables

#### `packages` — 사진 패키지 상품
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| title | text | NO | — |
| price_krw | integer | NO | — |
| reservation_url | text | NO | — |
| thumbnail_url | text | YES | — |
| details | text | YES | — |
| sample_image_urls | text[] | YES | — |
| occasions | occasion_enum[] | NO | `'{}'` |
| mood | mood_enum[] | YES | `'{}'` |
| duration_minutes | integer | YES | — |
| folder_path | text | YES | — |
| description | text | YES | — |
| Tips | text | YES | — (주의: 컬럼명이 대문자로 시작) |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |

**Trigger**: `set_updated_at()` 함수가 `updated_at` 컬럼을 자동 갱신.

#### `reservation_clicks` — 예약 버튼 클릭 분석
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| package_id | uuid | YES | FK → packages.id |
| package_title | text | NO | — |
| price_krw | integer | YES | — |
| clicked_at | timestamptz | NO | `now()` |
| user_agent | text | YES | — |
| referrer | text | YES | — |

#### `user_feedback` — 사용자 만족도 피드백
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| satisfaction_rating | integer | NO | — |
| improvement_suggestion | text | YES | — |
| user_agent | text | YES | — |
| referrer | text | YES | — |
| page_url | text | YES | — |
| created_at | timestamptz | NO | `now()` |

### 2.3 Database Function

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END$$;
```

### 2.4 RLS 정책 (현재 상태)

현재는 보안이 매우 느슨합니다. 마이그레이션 시 어드민 작업은 인증 뒤로 옮기는 것을 강력 권장합니다.

- `packages`: public SELECT, public UPDATE (인증 없이 누구나 수정 가능 — **취약**)
- `reservation_clicks`: public INSERT, public SELECT
- `user_feedback`: public INSERT, public SELECT

---

## 3. Storage

### 버킷 구성
- **버킷 이름**: `packages`
- **공개 여부**: Public
- **폴더 구조**: 패키지별 폴더 (`packages/<folder_path>/<image>.jpg`)
- **파일 종류**: jpg, jpeg, png, webp, gif

### 사용 패턴
- 어드민 페이지에서 업로드 (`src/pages/AdminImages.tsx`)
- `packages.folder_path`에 폴더 경로 저장
- `packages.thumbnail_url`에 대표 이미지 URL 저장
- `PackageImageGallery` 컴포넌트가 런타임에 `supabase.storage.from('packages').list(folder)`로 갤러리 로딩

### 이미지 변환 (중요)
Supabase의 `/storage/v1/render/image/public/` 엔드포인트를 사용해 width/quality 변환을 적용합니다. 마이그레이션 대상 플랫폼에서 동일한 기능이 필요합니다:
- **대안**: Cloudflare Images, imgix, Cloudinary, AWS Lambda@Edge + Sharp, Next.js Image Optimization 등

---

## 4. 코드 내 Supabase 의존성 위치

마이그레이션 시 수정해야 할 파일 목록:

### 4.1 클라이언트
- `src/integrations/supabase/client.ts` — Supabase JS 클라이언트 초기화
- `src/integrations/supabase/types.ts` — **자동 생성 파일**, 새 백엔드용 타입으로 교체 필요

### 4.2 데이터 fetching (런타임)
- `src/pages/Packages.tsx` — `supabase.from('packages').select('*')`
- `src/pages/PackageDetail.tsx` — 단일 패키지 fetch
- `src/pages/AdminImages.tsx` — 패키지 목록, storage list/upload, thumbnail update
- `src/pages/StorageTest.tsx` — storage upload 테스트
- `src/components/PackageImageGallery.tsx` — `supabase.storage.from('packages').list()`
- `src/components/FeedbackButton.tsx` — `user_feedback` insert
- `src/hooks/useReservationTracking.ts` — `reservation_clicks` insert

### 4.3 빌드 타임 (SSG)
- `scripts/fetch-data.mjs` — 빌드 시 모든 패키지를 fetch해서 `public/data/*.json` 생성
- `pages/index.page.server.ts` — 홈 페이지 SSR fetch
- `pages/packages/[id].page.server.ts` — 패키지 상세 SSR fetch + prerender 라우트 생성
- `pages/admin.page.server.ts` — 어드민 SSR

### 4.4 URL 포매팅
- `src/lib/utils.ts` — `formatThumbnailUrl()` 함수가 Supabase storage URL 형식에 강하게 결합되어 있음
- `scripts/fetch-data.mjs` — 동일 로직이 빌드 스크립트에 중복

### 4.5 환경 변수 (`.env`)
```
VITE_SUPABASE_PROJECT_ID="cvuirhzznizztbtclieu"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon key>"
VITE_SUPABASE_URL="https://cvuirhzznizztbtclieu.supabase.co"
```

### 4.6 SSR/SSG에 하드코딩된 URL
다음 파일들에 Supabase URL이 **하드코딩**되어 있어 검색 후 모두 교체해야 합니다:
- `src/integrations/supabase/client.ts`
- `scripts/fetch-data.mjs`
- `src/lib/utils.ts` (`https://cvuirhzznizztbtclieu.supabase.co/storage/...`)
- `pages/index.page.server.ts`
- `pages/packages/[id].page.server.ts`
- `renderer/_default.page.server.ts`

```bash
# 모든 occurrence 찾는 명령
rg "cvuirhzznizztbtclieu|supabase\.co" --type ts --type tsx --type js --type mjs
```

---

## 5. 데이터 export 방법

### 5.1 테이블 데이터
Supabase Dashboard → Table Editor → 각 테이블 → Export as CSV

또는 SQL:
```sql
COPY packages TO STDOUT WITH CSV HEADER;
COPY reservation_clicks TO STDOUT WITH CSV HEADER;
COPY user_feedback TO STDOUT WITH CSV HEADER;
```

### 5.2 Storage 파일
Supabase CLI:
```bash
supabase storage download --recursive packages ./backup/packages
```

또는 스크립트로 모든 객체를 list → getPublicUrl → curl 다운로드.

---

## 6. 마이그레이션 옵션 비교

| 플랫폼 | DB | Storage | 이미지 변환 | Auth | 난이도 |
|---|---|---|---|---|---|
| **Firebase** | Firestore (NoSQL — 스키마 재설계 필요) | Cloud Storage | ❌ (별도) | ✅ | 높음 |
| **AWS Amplify** | DynamoDB / RDS | S3 | CloudFront + Lambda | ✅ Cognito | 높음 |
| **Appwrite** | Postgres-like | ✅ | ✅ 내장 | ✅ | 낮음 (가장 유사) |
| **Pocketbase** | SQLite | ✅ | ✅ thumbs | ✅ | 낮음 (셀프 호스팅) |
| **Neon + Cloudflare R2 + Cloudflare Images** | Postgres | R2 | Cloudflare Images | Clerk/Auth.js | 중간 |
| **PlanetScale + S3** | MySQL (스키마 변환 필요) | S3 | imgix | 별도 | 중간 |
| **Convex** | 자체 reactive DB | ✅ | ❌ | ✅ | 중간 |

### 추천: Appwrite 또는 Pocketbase
스키마와 storage 패턴이 Supabase와 가장 가까워 코드 변경이 최소화됩니다. Postgres를 유지하고 싶다면 **Neon + Cloudflare R2** 조합이 가장 모던합니다.

---

## 7. 마이그레이션 체크리스트

### Phase 1: 데이터 백업
- [ ] 3개 테이블 CSV export
- [ ] `packages` 스토리지 버킷 전체 다운로드
- [ ] `.env`, `supabase/migrations/` 백업

### Phase 2: 새 백엔드 셋업
- [ ] 새 플랫폼 프로젝트 생성
- [ ] 동등한 스키마 생성 (enum 지원 안 되면 text + 검증으로 대체)
- [ ] 데이터 import
- [ ] Storage 버킷 생성 및 파일 업로드 (폴더 구조 유지!)
- [ ] 이미지 변환 파이프라인 구성

### Phase 3: 클라이언트 어댑터 작성
- [ ] `src/integrations/<new-backend>/client.ts` 생성
- [ ] 동일한 API surface를 가진 wrapper 작성 (`from().select()`, `storage.from().list()` 등) — 또는 코드 전체에서 호출 패턴 변경
- [ ] `src/lib/utils.ts`의 `formatThumbnailUrl` 새 storage URL 형식으로 재작성
- [ ] `scripts/fetch-data.mjs` 새 백엔드 SDK로 변환
- [ ] SSR pages (`pages/**/*.page.server.ts`) 변환
- [ ] `.env` 키 변경 + 모든 하드코딩된 URL 교체

### Phase 4: 검증
- [ ] `bun run build` 성공
- [ ] `public/data/packages.json` 정상 생성
- [ ] 모든 패키지 카드 이미지 로드 확인
- [ ] 패키지 상세 페이지 갤러리 로드 확인
- [ ] 어드민 업로드/썸네일 변경 동작 확인
- [ ] 예약 클릭 트래킹 insert 확인
- [ ] 피드백 submit 확인

### Phase 5: 보안 강화 (권장)
- [ ] 어드민 페이지에 인증 추가 (현재 누구나 접근 가능)
- [ ] `packages` 테이블 UPDATE를 인증된 사용자로 제한
- [ ] Service role key는 절대 클라이언트에 노출 금지

---

## 8. 알려진 이슈 / 주의사항

1. **`Tips` 컬럼**은 대문자로 시작하므로 SQL에서 따옴표 필수: `"Tips"`
2. **enum 배열** (`occasions`, `mood`)은 Postgres 고유 기능. 다른 DB로 가면 별도 join 테이블 또는 JSON 배열로 변환 필요
3. **이미지 egress 비용**이 Supabase Free plan을 초과한 이력이 있음 → 새 플랫폼에서도 CDN 캐싱 / 이미지 최적화 필수
4. **SSG 빌드는 백엔드 anon key가 필요** — CI/CD에 환경 변수 등록 필요
5. **`renderer/_default.page.server.ts`의 OG 이미지 URL**도 storage URL을 직접 사용하므로 교체 필요

---

## 9. 참고 파일

마이그레이션 시 가장 먼저 읽어야 할 파일들:
1. `src/integrations/supabase/client.ts` — 클라이언트 초기화 패턴
2. `src/integrations/supabase/types.ts` — DB 타입 정의 (참고용, 새 백엔드용으로 재생성)
3. `scripts/fetch-data.mjs` — 빌드 시 데이터 fetch 로직
4. `src/lib/utils.ts` — URL 포매팅 로직
5. `SSG_README.md` — SSG 아키텍처 설명
6. `supabase/migrations/` — 모든 DB 변경 이력 (스키마 재구축 시 reference)

---

문서 버전: 2026-04-26
