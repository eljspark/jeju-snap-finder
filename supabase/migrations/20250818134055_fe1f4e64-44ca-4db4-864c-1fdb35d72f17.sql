-- Temporary public insert policy for debug path in packages bucket (PostgreSQL doesn't support IF NOT EXISTS for CREATE POLICY)
CREATE POLICY "Public insert to packages debug path"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'packages' AND (name LIKE 'debug/%')
);