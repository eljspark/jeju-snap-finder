# JejuSnapFinder

제주도 스냅 사진 전문 업체 찾기 서비스

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **Routing**: React Router DOM
- **SSG**: vite-plugin-ssr (for SEO optimization)

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드 (SSG 포함)
npm run build

# 프리렌더링 검증
node scripts/verify-prerender.mjs
```

## SSG 프리렌더링

이 프로젝트는 SEO 최적화를 위해 vite-plugin-ssr을 사용하여 정적 HTML을 생성합니다.

### 프리렌더링되는 페이지

1. **홈페이지** (`/`) - 추천 패키지 목록
2. **제주 전체 목록** (`/jeju`) - 모든 활성 패키지
3. **카테고리별 목록** (`/jeju/:occasion`) - 특정 테마별 패키지
4. **패키지 상세** (`/packages/:id`) - 개별 패키지 정보

### 작동 원리

- 빌드 시점에 Supabase에서 활성 패키지 데이터를 가져옴
- 각 페이지의 HTML에 실제 패키지 정보가 포함됨
- 클라이언트에서 하이드레이션되어 SPA 기능 유지
- 검색엔진과 AdSense가 실제 콘텐츠를 읽을 수 있음

### 콘텐츠 업데이트

패키지를 추가하거나 수정한 후 프리렌더링된 HTML을 업데이트하려면:

1. Vercel에서 재배포 실행
2. 또는 `npm run build`로 로컬 빌드 후 배포

### SEO 최적화

- 각 페이지마다 동적 메타 태그 생성
- Open Graph 및 Twitter Card 지원
- JSON-LD 구조화 데이터 포함
- 검색엔진 친화적인 URL 구조

## 데이터베이스 스키마

### packages 테이블

- `id`: UUID (Primary Key)
- `title`: 패키지 제목
- `price_krw`: 가격 (원)
- `details`: 상세 설명
- `occasions`: 촬영 테마 배열
- `duration_minutes`: 촬영 시간
- `folder_path`: 샘플 이미지 폴더 경로
- `thumbnail_url`: 대표 이미지 URL
- `active`: 활성 여부
- `created_at`: 생성일
- `updated_at`: 수정일

## 폴더 구조

```
pages/                    # vite-plugin-ssr 페이지
├── _default/            # 기본 설정
├── index/               # 홈페이지
├── jeju/               # 제주 목록 페이지
│   └── @occasion/      # 카테고리별 페이지
└── packages/
    └── @id/            # 패키지 상세 페이지

src/
├── components/         # 재사용 가능한 컴포넌트
├── pages/             # 기존 React 페이지 컴포넌트
├── hooks/             # 커스텀 훅
└── lib/               # 유틸리티 함수
```

## 배포

Vercel에 배포 시 빌드 명령어가 자동으로 프리렌더링을 실행하여 정적 HTML을 생성합니다.

빌드 출력물에서 실제 패키지 제목과 가격이 HTML 소스에 포함되어 있는지 확인하세요.

---

## Project info

**URL**: https://lovable.dev/projects/747e2aca-18db-42b8-a3aa-fb5a9c4f7214
