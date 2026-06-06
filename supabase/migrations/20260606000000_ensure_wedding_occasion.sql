-- Ensure wedding packages can be assigned through the packages.occasions enum array.
ALTER TYPE public.occasion_enum ADD VALUE IF NOT EXISTS '웨딩';
