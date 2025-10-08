-- Add description column to packages table
ALTER TABLE public.packages
ADD COLUMN description text;

-- Update packages with generated descriptions
UPDATE public.packages
SET description = '택하다제주와 함께하는 특별한 순간. 1시간 동안 800-1000장의 원본과 정밀 보정 10장으로 소중한 커플과 만삭 순간을 영원히 간직하세요.'
WHERE id = '4113ae6b-2e65-4436-9b8f-cd1fcb07de8f';

UPDATE public.packages
SET description = '캐주얼하고 생동감 넘치는 제이림스냅. 30분의 촬영으로 50장 이상의 원본과 세심한 보정 10장을 제공하는 우정과 커플을 위한 완벽한 선택입니다.'
WHERE id = 'b410b167-4f29-479b-a8c5-0e62dce836ee';

UPDATE public.packages
SET description = '따뜻하고 감성적인 송그림일기스냅. 가족의 소중한 일상을 40분 동안 담아내며, 모든 색보정 원본과 정밀 포토샵 옵션을 제공합니다.'
WHERE id = '96eb7381-5437-4b0e-b336-00b31c06e7ed';

UPDATE public.packages
SET description = '밝고 희망찬 브라이트데이 스냅. 30분의 촬영으로 30컷의 색보정 사진과 작가 셀렉 5장, 미리보기 3장을 제공하는 만삭과 커플을 위한 패키지입니다.'
WHERE id = '4b3444b3-f8e6-4e59-8169-9963dafffbcc';

UPDATE public.packages
SET description = '의미 있고 감동적인 제주스냅. 2시간 동안 모든 원본과 15장의 세부 보정으로 커플의 특별한 순간을 깊이 있게 담아냅니다.'
WHERE id = 'eae4fb0a-9c54-4ee6-9b48-e53889593392';

UPDATE public.packages
SET description = '활기차고 모험적인 오르다스냅. 1시간 동안 모든 원본 사진과 작가&고객 셀렉 보정 총 10장으로 우정과 커플의 역동적인 순간을 포착합니다.'
WHERE id = 'c7262f20-dd6f-40a4-8305-4a210e17fbc7';