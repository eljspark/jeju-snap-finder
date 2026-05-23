import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Rocket } from 'lucide-react';

const MOOD_OPTIONS = [
  '로맨틱', '자연스러운', '밝은', '감성적인', '따뜻한', '청량한', '모던한',
  '빈티지', '편안한', '활기찬', '차분한', '몽환적인', '고요한', '순수한',
] as const;

const DEPLOY_HOOK_STORAGE_KEY = 'vercel_deploy_hook_url';
const MODEL = 'claude-sonnet-4-6';
const MAX_IMAGES = 6;

// Exported so AdminImages (which owns the context-images state + UI) can
// use the same shape.
export interface ContextImage {
  file: File;
  base64: string;
  mediaType: string;
  previewUrl: string;
}

export const MAX_CONTEXT_IMAGES = 3;
export const MAX_CONTEXT_FILE_BYTES = 4 * 1024 * 1024; // ~5.3MB after base64; under Claude's 5MB encoded limit when packed alone.

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface Props {
  packageId: string;
  packageTitle: string;
  occasions: string[] | null;
  imageUrls: string[];
  contextImages: ContextImage[];
  onAfterSave: () => void;
}

interface AIResult {
  description: string;
  details: string;
  tips: string;
  mood: string[];
}

function pickEvenly<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function buildAnthropicRequest(
  packageTitle: string,
  occasions: string[] | null,
  urls: string[],
  contextImages: ContextImage[],
) {
  const workPhotoBlocks = urls.map((url) => ({
    type: 'image' as const,
    source: { type: 'url' as const, url },
  }));

  const contextBlocks = contextImages.map((img) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: img.mediaType,
      data: img.base64,
    },
  }));

  const occasionLine =
    occasions && occasions.length > 0
      ? `이 패키지의 타깃 촬영 용도(occasions)는 다음과 같습니다: **${occasions.join(', ')}**. 이 용도에 맞춰 카피·디테일·팁을 작성하세요. (예: 만삭 → 임신 주차/태교 소품 팁, 우정 → 친구 그룹 동선/단체 의상 팁, 가족 → 아이 컨디션·소품 팁, 커플 → 케미/포즈 가이드)`
      : `이 패키지는 occasions 정보가 없으므로 사진에서 추론한 분위기에 맞춰 작성하세요.`;

  const instruction = `당신은 제주도 스냅 사진 패키지를 매력적으로 소개하는 한국어 카피라이터입니다.
첨부된 사진들은 "${packageTitle}" 작가/패키지의 샘플 이미지입니다.

${occasionLine}

# 톤앤매너 (매우 중요)
운영자가 친구에게 추천해주듯 편안하고 다정한 말투로 써주세요.
- 어미: "~에요", "~해요", "~좋아요", "~인 것 같아요", "~챙겨오시면 좋아요"
- 형식적인 마케팅 문구나 광고체 금지 ("완성합니다", "포착합니다" 같은 딱딱한 마침형 X)
- 가끔 가벼운 감탄("!")이나 부드러운 권유체("~해보세요", "~챙겨오시면 더 예쁘게 나올 수 있어요") OK
- "고객님"이라고 부르지 말기. "예비 부모", "커플", "가족" 등 상황어로 자연스럽게 지칭

# 각 필드 스타일 가이드

## description (한 줄, 25~40자)
- 사진의 핵심 무드와 감정을 한 문장으로 압축
- 가격/시간/컷수 같은 스펙 절대 넣지 말기 (스펙은 details에 있는 게 아니라 별도 필드에서 자동 노출됨)
- 좋은 예: "새 생명과 함께 제주에서 담아내는 우리만의 빛나는 순간"
- 좋은 예: "세련되고 우아한 무드의 ${packageTitle}"
- 나쁜 예: "30분 동안 30컷의 색보정 사진을 제공하는 패키지" (스펙 나열)

## details (2~3개의 짧은 문단, 총 4~6문장)
- 첫 문단: 사진의 톤·분위기·무엇을 담아내는지 (배경, 색감, 감정)
- 둘째 문단: 어떤 사람/상황에 잘 어울리는지 + 작가의 작은 강점 (소품 활용, 아이와의 케미, 골든아워 활용 등)
- (선택) 셋째 문단 **— 패키지 정보 스크린샷이 첨부된 경우에만**: 원본/보정 컷 수, 촬영 시간, 포함 사항, 추가 옵션 등 **스크린샷에 명시된 구체적인 숫자·항목을 그대로 옮겨 적기**. 같은 톤("~에요/~해요")으로 자연스럽게 풀어쓰기. 스크린샷에 없는 정보는 절대 추측하지 말기.
  - 좋은 예: "촬영은 약 1시간 진행되고, 원본 50컷 + 보정 20컷을 받아보실 수 있어요. 의상은 1벌이 기본이며 추가 +30,000원으로 옷을 더 가져오실 수 있어요."
- 길지 않게, 카드 본문처럼 부담 없이
- 좋은 예시 (만삭 스냅):
  "${packageTitle}은 드넓은 초원, 설원, 바다 절벽 등 제주의 사계절 자연을 배경으로 예비 부모의 설렘과 사랑을 필름 감성 가득한 톤으로 포착해요. 커플 간의 따뜻한 교감과 만삭의 아름다움을 자연스럽고 서정적으로 담아내어, 보는 것만으로도 그 날의 감동이 전해져요!

  출산을 앞둔 예비 부부, 특별한 임신 기념을 원하는 커플에게 특히 잘 어울리며, 아기 초음파 사진이나 태교 인형 등 소품을 활용한 스토리텔링 컷도 섬세하게 연출해드리는 것이 ${packageTitle}의 강점이에요."

## tips (3~5개 bullet)
- 각 줄을 '- '로 시작 (마크다운 bullet)
- 각 항목은 **하나의 실용적인 정보**를 짧은 한 문장으로 (1~2줄 분량)
- 운영자 톤: "~추천드려요", "~챙겨오시면 좋아요", "~준비해오시면 ~을 남길 수 있어요"
- 다루기 좋은 주제 (사진을 보고 자연스럽게 추론):
  · 촬영 시기/시간대 추천 (만삭 32~36주, 골든아워 등)
  · 의상 색감/소재 추천 (배경 톤과 매치)
  · 챙겨오면 좋은 소품 (헤어핀, 모자, 태교 인형, 초음파 사진 등)
  · 날씨/계절 주의사항
  · 동선·페이스 팁
- 기존 Tips처럼 "촬영용도:/촬영배경:/의상:" 같은 긴 단락형 절대 금지. 반드시 짧은 bullet
- 좋은 예:
  - 만삭 촬영은 보통 임신 32~36주 사이가 배가 가장 예쁘게 나오는 시기로 추천드려요.
  - 아기 초음파 사진, 태명이 적힌 소품, 아기 인형 등을 준비해오시면 스토리 있는 컷을 남길 수 있어요.
  - 야외 촬영 특성상 바람이 강할 수 있으니 헤어핀·헤드스카프 등 헤어 고정 소품을 챙겨오시면 사진이 더 예쁘게 나올 수 있어요.

## mood
다음 enum에서만 1~3개 선택: ${MOOD_OPTIONS.join(', ')}

# 출력
아래 JSON을 정확한 형식으로 반환하세요. JSON 외 다른 텍스트, 코드펜스(\`\`\`) 절대 출력하지 마세요.
줄바꿈은 \\n으로 이스케이프하세요 (특히 details의 문단 구분, tips의 bullet 구분).

{
  "description": "...",
  "details": "...",
  "tips": "- ...\\n- ...\\n- ...",
  "mood": ["로맨틱","자연스러운"]
}`;

  // Build message content with text separators so Claude knows which
  // images are work samples vs. landing-page context.
  const content: any[] = [];

  if (workPhotoBlocks.length > 0) {
    content.push({
      type: 'text' as const,
      text: `[작가 작품 샘플 — 분위기·톤·무드 추정에 사용. description / Tips / mood 작성 시 주로 참고하세요.]`,
    });
    content.push(...workPhotoBlocks);
  }

  if (contextBlocks.length > 0) {
    content.push({
      type: 'text' as const,
      text: `[패키지 정보 스크린샷 — 작가가 운영하는 외부 페이지(카카오채널/블로그/스마트스토어 등)에서 캡처한 텍스트 위주 이미지. 원본 컷 수, 보정 컷 수, 촬영 시간, 포함 사항, 추가 옵션 가격, 의상/소품 안내 등 **구체적인 사실 정보**를 담고 있습니다. details 필드를 작성할 때 여기 적힌 숫자·항목을 그대로 반영하세요. 추측 금지.]`,
    });
    content.push(...contextBlocks);
  }

  content.push({ type: 'text' as const, text: instruction });

  return {
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: 'user' as const,
        content,
      },
    ],
  };
}

function parseAIResponse(data: any): AIResult {
  const text: string =
    data?.content?.[0]?.text ??
    data?.completion ??
    '';
  if (!text) throw new Error('빈 응답');

  // Strip markdown code fences if present
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`JSON 파싱 실패: ${cleaned.slice(0, 200)}`);
  }

  return {
    description: String(parsed.description ?? ''),
    details: String(parsed.details ?? ''),
    tips: String(parsed.tips ?? ''),
    mood: Array.isArray(parsed.mood)
      ? parsed.mood.filter((m: any) => MOOD_OPTIONS.includes(m))
      : [],
  };
}

export default function AIPackageDescGenerator({
  packageId,
  packageTitle,
  occasions,
  imageUrls,
  contextImages,
  onAfterSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [tips, setTips] = useState('');
  const [mood, setMood] = useState<string[]>([]);

  const { toast } = useToast();

  const generate = async () => {
    if (imageUrls.length === 0 && contextImages.length === 0) {
      toast({ title: '먼저 이미지를 업로드하세요', variant: 'destructive' });
      return;
    }
    const picked = pickEvenly(imageUrls, MAX_IMAGES);
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
        body: buildAnthropicRequest(packageTitle, occasions, picked, contextImages),
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error?.message ?? String(data.error));

      const result = parseAIResponse(data);
      setDescription(result.description);
      setDetails(result.details);
      setTips(result.tips);
      setMood(result.mood);
      setOpen(true);
    } catch (err: any) {
      toast({
        title: 'AI 생성 실패',
        description: String(err?.message ?? err),
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleMood = (m: string) => {
    setMood((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const saveAndRedeploy = async () => {
    setSaving(true);
    try {
      const updatePayload: Record<string, unknown> = {
        description: description.trim() || null,
        details: details.trim() || null,
        Tips: tips.trim() || null,
        mood: mood.length > 0 ? mood : null,
      };
      const { error } = await supabase
        .from('packages')
        .update(updatePayload)
        .eq('id', packageId);
      if (error) throw error;

      let redeployMsg = '저장됨 (수동 재배포 필요)';
      const hookUrl =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(DEPLOY_HOOK_STORAGE_KEY)
          : null;
      if (hookUrl) {
        try {
          const res = await fetch(hookUrl, { method: 'POST' });
          if (res.ok) redeployMsg = '저장 + 재배포 트리거됨 (2~5분 후 반영)';
          else redeployMsg = `저장됨, 재배포 트리거 실패 (HTTP ${res.status})`;
        } catch {
          redeployMsg = '저장됨, 재배포 트리거 실패 (네트워크 오류)';
        }
      }

      toast({ title: '완료', description: redeployMsg });
      setOpen(false);
      // Notify parent so it can clear its context-screenshot state
      // (those images shouldn't carry over to another package).
      onAfterSave();
    } catch (err: any) {
      toast({
        title: '저장 실패',
        description: String(err?.message ?? err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const totalImages = imageUrls.length + contextImages.length;

  return (
    <>
      <Button
        onClick={generate}
        disabled={totalImages === 0 || generating}
        size="sm"
        variant="default"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI 생성 중...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            AI로 description·details·Tips 생성 (작품 {Math.min(imageUrls.length, MAX_IMAGES)}장 + 컨텍스트 {contextImages.length}장)
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI 생성 결과 — {packageTitle}</DialogTitle>
            <DialogDescription>
              아래 내용을 검토·수정 후 "저장 + 재배포"를 누르세요. 저장하면 packages 테이블에
              UPDATE되고 (Deploy Hook 저장돼 있으면) 자동 재배포됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>description (한 줄 카피)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label>details (상세)</Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={6}
              />
            </div>

            <div>
              <Label>Tips</Label>
              <Textarea
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                rows={6}
              />
            </div>

            <div>
              <Label>mood (분위기)</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {MOOD_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={mood.includes(opt)}
                      onCheckedChange={() => toggleMood(opt)}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              취소
            </Button>
            <Button onClick={saveAndRedeploy} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  저장 + 재배포
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
