-- Create feedback table
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satisfaction_rating INTEGER NOT NULL CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  improvement_suggestion TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous feedback inserts"
ON public.user_feedback
FOR INSERT
WITH CHECK (true);

-- Allow public read for analytics
CREATE POLICY "Allow public read for feedback analytics"
ON public.user_feedback
FOR SELECT
USING (true);

-- Add index for analytics queries
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at DESC);
CREATE INDEX idx_user_feedback_rating ON public.user_feedback(satisfaction_rating);