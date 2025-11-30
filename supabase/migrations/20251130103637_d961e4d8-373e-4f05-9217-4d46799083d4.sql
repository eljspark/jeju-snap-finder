-- Create mood enum type with predefined hashtags
CREATE TYPE public.mood_enum AS ENUM (
  '로맨틱',
  '자연스러운',
  '밝은',
  '감성적인',
  '따뜻한',
  '청량한',
  '모던한',
  '빈티지',
  '편안한',
  '활기찬',
  '차분한',
  '몽환적인'
);

-- Drop the existing text column and recreate as enum array
ALTER TABLE public.packages
DROP COLUMN mood;

ALTER TABLE public.packages
ADD COLUMN mood public.mood_enum[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.packages.mood IS 'Photography mood hashtags for the package';