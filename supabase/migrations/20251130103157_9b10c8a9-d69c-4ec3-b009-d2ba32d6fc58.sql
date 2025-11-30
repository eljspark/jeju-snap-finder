-- Add mood column to packages table
ALTER TABLE public.packages
ADD COLUMN mood TEXT;