-- Revert incorrect double /packages/packages/ path to single /packages/ path
-- Fix the 8 packages that were incorrectly updated in the previous migration
UPDATE packages
SET thumbnail_url = REPLACE(
  thumbnail_url,
  'https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages/packages/',
  'https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages/'
)
WHERE id IN (
  'c76e37c3-5ac0-46f6-bae4-55b64e21ef86',  -- 누보스튜디오
  '91e7c774-64d3-4988-8455-40cba2b3167c',  -- 니우스튜디오
  '054e7d21-36df-4ef3-a2c3-bac81908a895',  -- 소우주스냅
  'acbb526d-5dd8-478b-9a69-6fb6f6ef3a34',  -- 여리스냅
  'a3f734b7-0fb7-4ca1-9491-8396d54d4e4e',  -- 연결
  'e209705b-5e34-420a-b062-1d49fcee0351',  -- 오랜지팝스튜디오
  '4b3b397a-abcf-4219-b616-4af43f996df8',  -- 올레감사제주스냅
  '499f3084-2c8a-4680-b04a-567f86474625'   -- 제주귤반스튜디오
)
AND thumbnail_url LIKE '%/packages/packages/%';