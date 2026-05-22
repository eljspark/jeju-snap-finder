-- Prospects table: 인스타에서 발굴한 제주 스냅 작가 후보 (영입 전 단계)
-- packages 테이블로 승격되기 전 staging 역할.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 컨택 상태 enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prospect_contact_status') THEN
    CREATE TYPE public.prospect_contact_status AS ENUM (
      'new',         -- 새로 발견, 미접촉
      'contacted',   -- DM/이메일 발송
      'replied',     -- 답신 받음
      'onboarded',   -- packages 테이블로 승격됨
      'rejected',    -- 거절 또는 영입 포기
      'unfit'        -- 사후 판단상 부적합 (스타일/지역 등)
    );
  END IF;
END
$$;

-- 네이버 등록 여부 enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prospect_naver_status') THEN
    CREATE TYPE public.prospect_naver_status AS ENUM (
      'unchecked',
      'not_registered',    -- 인스타만 운영 (영입 타깃)
      'booking_only',      -- 네이버 예약만
      'smartstore_only',   -- 스마트스토어만
      'both'               -- 둘 다 등록 (영입 우선순위 낮음)
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 인스타 식별자 (unique)
  ig_username TEXT NOT NULL UNIQUE,
  ig_display_name TEXT,
  ig_profile_url TEXT GENERATED ALWAYS AS ('https://instagram.com/' || ig_username) STORED,

  -- 인스타 지표 (스크린샷에서 추출)
  followers_count INTEGER,
  following_count INTEGER,
  posts_count INTEGER,
  bio TEXT,
  external_link TEXT,

  -- 바이오 기반 신호 (영입 가능성 판단)
  has_smartstore_link BOOLEAN DEFAULT FALSE,
  has_naver_booking_link BOOLEAN DEFAULT FALSE,
  has_kakao_link BOOLEAN DEFAULT FALSE,
  has_dm_only BOOLEAN DEFAULT FALSE,

  -- 발굴 컨텍스트
  hashtag_source TEXT,                  -- 어떤 해시태그에서 발견했는지 (예: '#제주스냅')
  shoot_styles public.occasion_enum[] DEFAULT '{}',  -- 추정 촬영 스타일
  shoot_region TEXT,                    -- 제주 / 서울 / 부산 등 (바이오/태그에서 추정)

  -- 네이버 등록 여부
  naver_status public.prospect_naver_status NOT NULL DEFAULT 'unchecked',
  naver_booking_search_url TEXT,        -- 클릭 한 번으로 확인용
  naver_smartstore_search_url TEXT,

  -- 컨택 진행
  contact_status public.prospect_contact_status NOT NULL DEFAULT 'new',
  contact_note TEXT,
  contacted_at TIMESTAMPTZ,

  -- 메타
  source_screenshot_path TEXT,
  raw_extraction JSONB,                 -- Claude vision 원본 응답 (디버깅용)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_contact_status ON public.prospects(contact_status);
CREATE INDEX IF NOT EXISTS idx_prospects_naver_status ON public.prospects(naver_status);
CREATE INDEX IF NOT EXISTS idx_prospects_followers ON public.prospects(followers_count DESC);

-- RLS: 어드민 페이지(인증 없음)에서 읽기/쓰기 가능하게 일단 public 허용.
-- 추후 인증 붙이면 정책 좁히기.
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'prospects' AND policyname = 'Public read prospects'
  ) THEN
    CREATE POLICY "Public read prospects" ON public.prospects FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'prospects' AND policyname = 'Public insert prospects'
  ) THEN
    CREATE POLICY "Public insert prospects" ON public.prospects FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'prospects' AND policyname = 'Public update prospects'
  ) THEN
    CREATE POLICY "Public update prospects" ON public.prospects FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END
$policy$;

-- updated_at 자동 갱신
DROP TRIGGER IF EXISTS set_updated_at_on_prospects ON public.prospects;
CREATE TRIGGER set_updated_at_on_prospects
BEFORE UPDATE ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
