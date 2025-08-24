-- Allow public listing and uploads to the 'packages' storage bucket
-- Note: Bucket is already public for reads via public URL, but RLS still applies for list/insert

-- Create SELECT policy so the app can list files in the bucket
CREATE POLICY IF NOT EXISTS "Public can list files in packages"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'packages');

-- Create INSERT policy so the app can upload files to the bucket
CREATE POLICY IF NOT EXISTS "Public can upload files to packages"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'packages');