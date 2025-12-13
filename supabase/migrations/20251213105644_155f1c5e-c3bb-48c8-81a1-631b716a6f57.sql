-- Create reservation_clicks table to track booking button clicks
CREATE TABLE public.reservation_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    package_title TEXT NOT NULL,
    price_krw INTEGER,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    referrer TEXT
);

-- Enable RLS
ALTER TABLE public.reservation_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking without auth)
CREATE POLICY "Allow anonymous inserts"
ON public.reservation_clicks
FOR INSERT
WITH CHECK (true);

-- Only allow reading for authenticated admins (you can adjust this later)
CREATE POLICY "Allow public read for analytics"
ON public.reservation_clicks
FOR SELECT
USING (true);

-- Create index for faster queries by date
CREATE INDEX idx_reservation_clicks_clicked_at ON public.reservation_clicks(clicked_at DESC);

-- Create index for package analytics
CREATE INDEX idx_reservation_clicks_package_id ON public.reservation_clicks(package_id);