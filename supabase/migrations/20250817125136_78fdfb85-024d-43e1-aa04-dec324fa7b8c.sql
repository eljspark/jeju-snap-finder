-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the occasion enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'occasion_enum') THEN
    CREATE TYPE public.occasion_enum AS ENUM ('커플','가족','우정','프로필','웨딩','만삭');
  END IF;
END
$$;

-- Create packages table if it doesn't exist (minimal fields + occasions enum[])
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price_krw INTEGER NOT NULL CHECK (price_krw >= 0),
  reservation_url TEXT NOT NULL,
  thumbnail_url TEXT,
  details TEXT,
  sample_image_urls TEXT[],
  occasions public.occasion_enum[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and allow public reads (so the app can list packages)
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'packages' AND policyname = 'Public read packages'
  ) THEN
    CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);
  END IF;
END
$policy$;

-- If occasions column exists but isn't the enum[], convert it; otherwise add it
DO $$
DECLARE
  col_udt TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='packages' AND column_name='occasions'
  ) THEN
    SELECT udt_name INTO col_udt
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='packages' AND column_name='occasions';

    IF col_udt <> '_occasion_enum' THEN
      ALTER TABLE public.packages
      ALTER COLUMN occasions TYPE public.occasion_enum[]
      USING (
        CASE
          WHEN occasions IS NULL THEN '{}'::public.occasion_enum[]
          ELSE ARRAY(SELECT unnest(occasions::text[])::public.occasion_enum)
        END
      );
      ALTER TABLE public.packages ALTER COLUMN occasions SET NOT NULL;
      ALTER TABLE public.packages ALTER COLUMN occasions SET DEFAULT '{}';
    END IF;
  ELSE
    ALTER TABLE public.packages ADD COLUMN occasions public.occasion_enum[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS set_updated_at_on_packages ON public.packages;
CREATE TRIGGER set_updated_at_on_packages
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Seed demo data only if table is empty
INSERT INTO public.packages (
  title, price_krw, reservation_url, thumbnail_url, details, sample_image_urls, occasions
)
SELECT
  '제주 커플 석양 스냅',
  150000,
  'https://instagram.com/snapfinder_demo',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=1200&auto=format',
  '제주 해안 산책로에서 진행하는 로맨틱 석양 스냅.',
  ARRAY[
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format'
  ],
  ARRAY['커플','프로필']::public.occasion_enum[]
WHERE NOT EXISTS (SELECT 1 FROM public.packages);

INSERT INTO public.packages (
  title, price_krw, reservation_url, thumbnail_url, details, sample_image_urls, occasions
)
SELECT
  '서울 우정 스냅',
  90000,
  'https://pf.kakao.com/_demo',
  'https://images.unsplash.com/photo-1515165562835-c3b8c8c0c9a0?q=80&w=1200&auto=format',
  '친구들과 함께하는 감성 스냅.',
  ARRAY[
    'https://images.unsplash.com/photo-1511407397940-d57f68e81203?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1535930749574-1399327ce78f?q=80&w=1200&auto=format'
  ],
  ARRAY['우정','프로필']::public.occasion_enum[]
WHERE NOT EXISTS (SELECT 1 FROM public.packages);

INSERT INTO public.packages (
  title, price_krw, reservation_url, thumbnail_url, details, sample_image_urls, occasions
)
SELECT
  '한강 가족 스냅',
  130000,
  'https://blog.example.com/snapfinder',
  'https://images.unsplash.com/photo-1513152697235-fe74c283646a?q=80&w=1200&auto=format',
  '자연스러운 가족의 순간을 담아드립니다.',
  ARRAY[
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1520975922284-5f573c5e4b88?q=80&w=1200&auto=format'
  ],
  ARRAY['가족','프로필']::public.occasion_enum[]
WHERE NOT EXISTS (SELECT 1 FROM public.packages);
