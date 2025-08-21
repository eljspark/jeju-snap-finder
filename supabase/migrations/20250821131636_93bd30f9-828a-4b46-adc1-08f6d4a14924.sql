-- Add folder_path column for storing the storage folder path for package images
ALTER TABLE public.packages 
ADD COLUMN folder_path text;

-- Add constraint to limit folder_path to max 30 images (we'll enforce this in the application)
-- We can't easily enforce this at the database level since we're storing folder paths, not individual URLs

-- Update existing packages with a default folder path based on their ID
UPDATE public.packages 
SET folder_path = CONCAT('packages/', id::text, '/')
WHERE folder_path IS NULL;