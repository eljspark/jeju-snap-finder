# CLAUDE.md

이 문서는 Claude Code가 이 프로젝트에서 작업할 때 빠르게 컨텍스트를 잡기 위한 가이드입니다.

## 프로젝트 개요

제주도 스냅 사진 패키지 큐레이션 웹사이트. 사용자가 분위기·인물 구성·점유율로 패키지를 탐색하고 외부 예약 페이지로 이동합니다.

- 운영자: 개인 사이드 프로젝트 (eljspark)
- 배포: https://jejusnapfinder.vercel.app (Vercel, main 브랜치 push 시 자동)
- 깃헙: https://github.com/eljspark/jeju-snap-finder

## 스택

- Vite 5 + React 18 + TypeScript 5
- Tailwind CSS v3 + shadcn/ui (Radix 기반)
- `vite-plugin-ssr` 기반 SSG (빌드 시 Supabase에서 데이터 fetch → 정적 prerender)
- Supabase (Postgres + Storage)
- Vercel 배포

## 핵심 아키텍처: SSG 빌드 흐름

빌드는 두 단계입니다.

1. `scripts/fetch-data.mjs` — Supabase에서 모든 패키지 데이터 fetch → `public/data/*.json` 생성
2. `vite build` (with `vite-plugin-ssr`) — 위 JSON을 읽어 각 패키지 상세 페이지까지 정적 HTML로 prerender (현재 25개 페이지)

즉 빌드 시점에 **Supabase anon key가 필요**합니다. Vercel CI 환경변수에 등록되어 있어야 빌드 성공.

자세한 SSG 구조는 `SSG_README.md`, 백엔드 마이그레이션 정보는 `MIGRATION_GUIDE.md` 참고.

## 디렉터리 구조

- `src/` — React 앱 본체
  - `pages/` — 클라이언트 라우트 (Packages, PackageDetail, AdminImages, StorageTest, NotFound)
  - `components/` — 공통 UI 컴포넌트 (shadcn 포함)
  - `integrations/supabase/` — Supabase 클라이언트 + 자동 생성된 DB 타입
  - `lib/utils.ts` — `formatThumbnailUrl()` 등 URL 포매팅 (Supabase storage URL 형식에 의존)
  - `hooks/` — `useReservationTracking` 등
- `pages/` — `vite-plugin-ssr` 라우트 및 SSG 엔트리 (`*.page.tsx`, `*.page.server.ts`)
- `renderer/` — SSR 렌더러 (HTML 셸, OG 메타)
- `scripts/` — 빌드 시점 데이터 fetch, sitemap 생성
- `public/data/` — 빌드 산출물 (커밋되어 있음, 빌드 시 갱신됨)
- `supabase/migrations/` — DB 마이그레이션 SQL

## 환경 변수

`.env`에 다음 키 필요:

| 키 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon 키 |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 프로젝트 ref |

`.env`는 git에 커밋하지 않습니다. `.env.example` 참고.

## 알려진 주의사항

1. **`packages.Tips` 컬럼명이 대문자로 시작** — SQL에서 따옴표 필수 (`"Tips"`)
2. **enum 배열** (`occasions`, `mood`) — Postgres 고유 기능. 다른 DB 이전 시 변환 필요
3. **어드민 페이지(`/admin`, `/admin-images`)가 인증 없이 열려있음** — 보안상 권장되지 않음, 추후 Supabase Auth 또는 게이트 추가 필요
4. **이전에 `.env`가 git 커밋된 history 존재** — anon key는 이미 공개됨, 키 재발급 권장
5. **빌드 산출물 (`public/data/*.json`, `public/sitemap.xml`, `public/robots.txt`) 이 커밋됨** — Vercel 빌드와 별개로 로컬 빌드 결과가 git에 들어가는 구조. 변경 시 의도적으로 commit하거나 무시할지 결정 필요

## 개발 워크플로우

### 빌드/실행
```sh
npm install
cp .env.example .env  # 값은 Supabase 프로젝트에서
npm run dev           # 개발 서버
npm run build         # SSG 프로덕션 빌드
npm run preview       # 빌드 결과 미리보기
```

### 작업 흐름 (회사 노트북 ↔ 개인 노트북)

이 프로젝트는 회사 노트북 Claude Code에서 코딩하지만, **회사 DLP가 외부 GitHub push를 차단**하기 때문에 push는 개인 노트북에서 수행합니다.

**회사 노트북 (코딩 후):**
```sh
cd /Users/jisang.park/workspace/personal-projects/jeju-snap-finder
git add -A
git commit -m "..."
git format-patch origin/main..HEAD -o ~/Desktop
# 생성된 .patch 파일을 카카오톡 '나에게' 또는 메일로 폰/개인노트북에 전송
```

**개인 노트북 (집 와서):**
```sh
cd ~/jeju-snap-finder       # 미리 클론해둔 폴더
git pull origin main        # 동기화
git am ~/Downloads/0001-*.patch
git push origin main
```

코딩에 관한 모든 작업은 회사 노트북에서, push만 개인 노트북에서 일어납니다.

## 러버블 의존성

이 프로젝트는 원래 [Lovable](https://lovable.dev)로 생성됐으나 현재 러버블 의존성은 제거되었습니다. 더 이상 러버블 대시보드에서 prompt하지 마세요 (충돌 위험). 모든 코드 변경은 Claude Code 또는 직접 편집으로만.

`src/integrations/supabase/types.ts`는 러버블이 생성한 파일이지만, Supabase CLI로 재생성 가능:
```sh
supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts
```
