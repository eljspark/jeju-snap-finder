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

interface Props {
  packageId: string;
  packageTitle: string;
  imageUrls: string[];
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

function buildAnthropicRequest(packageTitle: string, urls: string[]) {
  const imageBlocks = urls.map((url) => ({
    type: 'image' as const,
    source: { type: 'url' as const, url },
  }));

  const instruction = `당신은 제주도 스냅 사진 패키지를 매력적으로 소개하는 한국어 카피라이터입니다.
첨부된 사진들은 "${packageTitle}" 작가/패키지의 샘플 이미지입니다.

사진들을 보고 다음 JSON을 정확한 형식으로 반환하세요. JSON 외 다른 텍스트는 절대 출력하지 마세요.

{
  "description": "메인 카드에 노출될 한 줄(40~60자) 매력 카피. 사진 톤·스타일을 함축적으로.",
  "details": "패키지 상세 페이지 본문. 촬영 분위기, 어울리는 사람·상황, 결과물 톤, 작가의 강점을 3~5문장 한국어로.",
  "tips": "촬영 전 알아두면 좋은 팁 3~5개. 각 줄을 '- '로 시작하는 한국어 bullet list.",
  "mood": ["로맨틱","자연스러운"]
}

mood는 다음 enum에서만 1~3개 선택: ${MOOD_OPTIONS.join(', ')}

JSON만 출력하세요.`;

  return {
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: 'user' as const,
        content: [
          ...imageBlocks,
          { type: 'text' as const, text: instruction },
        ],
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
  imageUrls,
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
    if (imageUrls.length === 0) {
      toast({ title: '먼저 이미지를 업로드하세요', variant: 'destructive' });
      return;
    }
    const picked = pickEvenly(imageUrls, MAX_IMAGES);
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
        body: buildAnthropicRequest(packageTitle, picked),
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

  return (
    <>
      <Button
        onClick={generate}
        disabled={imageUrls.length === 0 || generating}
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
            AI로 description·details·Tips 생성 ({Math.min(imageUrls.length, MAX_IMAGES)}장 사용)
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
