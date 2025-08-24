-- Storage RLS policies to fix upload errors

-- Allow listing files in the 'packages' bucket
CREATE POLICY "Public can list files in packages"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'packages');

-- Allow uploads to the 'packages' bucket
CREATE POLICY "Public can upload files to packages"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'packages');