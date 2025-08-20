-- Add a duration_minutes column for per-package session duration (in minutes)
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Optional: ensure positive values when provided
ALTER TABLE public.packages
ADD CONSTRAINT packages_duration_minutes_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0);