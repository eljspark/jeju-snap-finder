-- Temporary public insert policy for debug path in packages bucket
create policy if not exists "Public insert to packages/debug path"
on storage.objects
for insert
with check (
  bucket_id = 'packages' and (name like 'debug/%')
);
