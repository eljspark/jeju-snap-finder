-- Allow public updates to packages table for thumbnail management
CREATE POLICY "Allow public updates to packages" 
ON public.packages 
FOR UPDATE 
USING (true) 
WITH CHECK (true);