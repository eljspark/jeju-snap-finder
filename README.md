# Jeju Snap Finder

제주도 스냅 사진 패키지 큐레이션 웹사이트. 사용자가 점유율·분위기·인물 구성 등으로 패키지를 탐색하고 외부 예약 페이지로 이동합니다.

배포: https://jejusnapfinder.vercel.app

## 스택

- Vite 5 + React 18 + TypeScript 5
- Tailwind CSS v3 + shadcn/ui (Radix UI 기반)
- `vite-plugin-ssr` 기반 SSG (빌드 시점에 Supabase 데이터 fetch → 정적 prerender)
- Supabase (Postgres + Storage)
- Vercel 배포

## 로컬 개발

Node.js 18 이상 필요.

```sh
# 의존성 설치
npm install

# .env.example을 복사해 .env 작성 (값은 Supabase 프로젝트에서 발급)
cp .env.example .env

# 개발 서버
npm run dev

# 프로덕션 빌드 (Supabase에서 데이터 fetch 후 SSG)
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 환경 변수

`.env`에 다음 키를 설정합니다.

| 키 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon 키 |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 프로젝트 ref |

`.env`는 git에 커밋하지 않습니다 (`.gitignore` 적용).

## 디렉터리 구조

- `src/` — React 앱 (페이지/컴포넌트/훅/유틸/Supabase 클라이언트)
- `pages/` — `vite-plugin-ssr`용 라우트 및 SSR/SSG 엔트리
- `renderer/` — SSR 렌더러 (HTML 셸, OG 메타 등)
- `scripts/` — 빌드 시점 데이터 fetch, sitemap 생성
- `public/` — 정적 자산 (빌드 시 `public/data/*.json` 생성됨)
- `supabase/` — DB 마이그레이션 SQL

자세한 SSG 아키텍처는 `SSG_README.md`, 백엔드 마이그레이션 메모는 `MIGRATION_GUIDE.md` 참고.

## 배포

main 브랜치 푸시 시 Vercel이 자동 빌드합니다. Vercel 프로젝트에 위 환경 변수가 등록되어 있어야 SSG 빌드가 성공합니다.
