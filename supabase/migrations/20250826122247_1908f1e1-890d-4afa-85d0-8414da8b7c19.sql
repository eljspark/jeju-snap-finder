-- Add missing values to occasion_enum to support CSV import
DO $$ BEGIN
  -- Add '아기' if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'occasion_enum' AND e.enumlabel = '아기'
  ) THEN
    EXECUTE 'ALTER TYPE public.occasion_enum ADD VALUE IF NOT EXISTS ''아기''';
  END IF;

  -- Add '개인' if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'occasion_enum' AND e.enumlabel = '개인'
  ) THEN
    EXECUTE 'ALTER TYPE public.occasion_enum ADD VALUE IF NOT EXISTS ''개인''';
  END IF;
END $$;