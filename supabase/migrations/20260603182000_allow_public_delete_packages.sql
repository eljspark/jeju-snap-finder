-- Allow admin package delete from the client-side admin page.
-- This matches the existing public client-side package update policy.
DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'packages'
      AND policyname = 'Allow public deletes to packages'
  ) THEN
    CREATE POLICY "Allow public deletes to packages"
    ON public.packages
    FOR DELETE
    USING (true);
  END IF;
END
$policy$;
