-- Fix the thumbnail URL for the 택하다제주 package to point to the correct location in storage
UPDATE public.packages 
SET thumbnail_url = 'https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages/4113ae6b-2e65-4436-9b8f-cd1fcb07de8f/taekhada.png'
WHERE id = '4113ae6b-2e65-4436-9b8f-cd1fcb07de8f';