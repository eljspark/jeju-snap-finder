
-- 1) Create a public storage bucket for package images
insert into storage.buckets (id, name, public)
values ('packages', 'packages', true)
on conflict (id) do update set public = true;

-- 2) Storage RLS policies for the 'packages' bucket
-- Public can read files from the 'packages' bucket
create policy "Public read access to packages"
on storage.objects
for select
using (bucket_id = 'packages');

-- Only authenticated users can upload (insert) into the 'packages' bucket
create policy "Authenticated users can upload to packages"
on storage.objects
for insert
with check (bucket_id = 'packages' and auth.role() = 'authenticated');

-- Only the uploader (owner) can update their own files
create policy "Authenticated users can update own files in packages"
on storage.objects
for update
using (bucket_id = 'packages' and owner = auth.uid())
with check (bucket_id = 'packages' and owner = auth.uid());

-- Only the uploader (owner) can delete their own files
create policy "Authenticated users can delete own files in packages"
on storage.objects
for delete
using (bucket_id = 'packages' and owner = auth.uid());
