import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2, Rocket, UserPlus } from 'lucide-react';

const OCCASION_OPTIONS = ['커플', '가족', '우정', '프로필', '웨딩', '만삭', '개인', '아기'] as const;
const MOOD_OPTIONS = [
  '로맨틱', '자연스러운', '밝은', '감성적인', '따뜻한', '청량한', '모던한',
  '빈티지', '편안한', '활기찬', '차분한', '몽환적인', '고요한', '순수한',
] as const;

const DEPLOY_HOOK_STORAGE_KEY = 'vercel_deploy_hook_url';

// prospects 테이블은 자동 생성된 Database 타입에 아직 없어서 로컬 인터페이스로 정의.
// supabase gen types로 재생성 시 이 인터페이스는 제거 가능.
interface Prospect {
  id: string;
  ig_username: string;
  ig_display_name: string | null;
  followers_count: number | null;
  bio: string | null;
  external_link: string | null;
  shoot_styles: string[] | null;
  contact_status: string;
}

// display_name "언트하우스 제주만삭스냅 | 제주도가족사진 | ..." → "언트하우스 제주만삭스냅"
function cleanProspectTitle(displayName: string | null, igUsername: string): string {
  const cleaned = (displayName || '').split(/[|｜]/)[0].trim();
  return cleaned || igUsername;
}

interface FormState {
  title: string;
  price_krw: string;
  reservation_url: string;
  duration_minutes: string;
  thumbnail_url: string;
  occasions: string[];
  mood: string[];
  description: string;
  details: string;
  Tips: string;
  folder_path: string;
}

const initialFormState: FormState = {
  title: '',
  price_krw: '',
  reservation_url: '',
  duration_minutes: '',
  thumbnail_url: '',
  occasions: [],
  mood: [],
  description: '',
  details: '',
  Tips: '',
  folder_path: '',
};

export default function PackageManager() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [redeploying, setRedeploying] = useState(false);
  const [lastInsertedTitle, setLastInsertedTitle] = useState<string | null>(null);
  const [deployHookUrl, setDeployHookUrl] = useState('');
  const [deployHookSaved, setDeployHookSaved] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<string>('');
  const [loadingProspects, setLoadingProspects] = useState(false);
  const { toast } = useToast();

  // Load Deploy Hook URL from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(DEPLOY_HOOK_STORAGE_KEY);
    if (saved) {
      setDeployHookUrl(saved);
      setDeployHookSaved(true);
    }
  }, []);

  // Load prospects (excluding already onboarded/rejected/unfit)
  const loadProspects = async () => {
    setLoadingProspects(true);
    try {
      const { data, error } = await (supabase as any)
        .from('prospects')
        .select('id, ig_username, ig_display_name, followers_count, bio, external_link, shoot_styles, contact_status')
        .not('contact_status', 'in', '(onboarded,rejected,unfit)')
        .order('followers_count', { ascending: false, nullsFirst: false });
      if (error) throw error;
      setProspects((data as Prospect[]) || []);
    } catch (err: any) {
      toast({
        title: 'Prospect 로드 실패',
        description: String(err?.message || err),
        variant: 'destructive',
      });
    } finally {
      setLoadingProspects(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const applyProspectToForm = (prospectId: string) => {
    setSelectedProspectId(prospectId);
    if (!prospectId) return;
    const p = prospects.find((x) => x.id === prospectId);
    if (!p) return;

    const cleanTitle = cleanProspectTitle(p.ig_display_name, p.ig_username);
    const bio = p.bio || '';
    const firstBioLine = bio.split('\n').find((l) => l.trim())?.trim() || '';
    // Only prefill occasions where the shoot_style matches our enum options
    const validOccasions = (p.shoot_styles || []).filter((s) =>
      (OCCASION_OPTIONS as readonly string[]).includes(s),
    );

    setForm((prev) => ({
      ...prev,
      title: cleanTitle,
      reservation_url: p.external_link || prev.reservation_url,
      occasions: validOccasions.length > 0 ? validOccasions : prev.occasions,
      description: firstBioLine || prev.description,
      details: bio || prev.details,
      folder_path: p.ig_username,
    }));

    toast({
      title: 'Prospect 데이터 적용됨',
      description: `@${p.ig_username} → 폼에 자동 입력. 가격·썸네일 등 나머지 항목 채우세요.`,
    });
  };

  const saveDeployHook = () => {
    if (typeof window === 'undefined') return;
    if (deployHookUrl.trim() === '') {
      window.localStorage.removeItem(DEPLOY_HOOK_STORAGE_KEY);
      setDeployHookSaved(false);
      toast({ title: 'Deploy Hook URL 삭제됨' });
      return;
    }
    if (!deployHookUrl.includes('vercel.com')) {
      toast({
        title: '올바른 Vercel Deploy Hook URL이 아닙니다',
        description: 'https://api.vercel.com/v1/integrations/deploy/... 형식이어야 합니다',
        variant: 'destructive',
      });
      return;
    }
    window.localStorage.setItem(DEPLOY_HOOK_STORAGE_KEY, deployHookUrl);
    setDeployHookSaved(true);
    toast({ title: 'Deploy Hook URL 저장됨', description: '이제 패키지 추가 후 자동으로 재배포됩니다' });
  };

  const triggerRedeploy = async () => {
    if (typeof window === 'undefined') return;
    const url = window.localStorage.getItem(DEPLOY_HOOK_STORAGE_KEY);
    if (!url) {
      toast({
        title: 'Deploy Hook URL이 저장되지 않음',
        description: '아래에서 Vercel Deploy Hook URL을 먼저 저장하세요',
        variant: 'destructive',
      });
      return;
    }
    setRedeploying(true);
    try {
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({
        title: '재배포 시작됨',
        description: '약 2~5분 후 카테고리 페이지와 패키지 상세에 반영됩니다',
      });
    } catch (err: any) {
      toast({
        title: '재배포 트리거 실패',
        description: String(err?.message || err),
        variant: 'destructive',
      });
    } finally {
      setRedeploying(false);
    }
  };

  const toggleArrayItem = (key: 'occasions' | 'mood', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.title.trim()) {
      toast({ title: '제목(title) 필수', variant: 'destructive' });
      return;
    }
    const priceNum = Number(form.price_krw);
    if (!form.price_krw || Number.isNaN(priceNum) || priceNum <= 0) {
      toast({ title: '가격(원) 필수 (숫자만)', variant: 'destructive' });
      return;
    }
    if (!form.reservation_url.trim()) {
      toast({ title: '예약 URL 필수', variant: 'destructive' });
      return;
    }
    if (form.occasions.length === 0) {
      toast({ title: '카테고리(occasions) 최소 1개 선택 필수', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        price_krw: priceNum,
        reservation_url: form.reservation_url.trim(),
        occasions: form.occasions,
      };
      if (form.duration_minutes) payload.duration_minutes = Number(form.duration_minutes);
      if (form.thumbnail_url.trim()) payload.thumbnail_url = form.thumbnail_url.trim();
      if (form.mood.length > 0) payload.mood = form.mood;
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.details.trim()) payload.details = form.details.trim();
      if (form.Tips.trim()) payload.Tips = form.Tips.trim();
      if (form.folder_path.trim()) payload.folder_path = form.folder_path.trim();

      const { data, error } = await supabase
        .from('packages')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setLastInsertedTitle(data.title);

      // If this package was created from a prospect, mark that prospect as onboarded
      // and remove it from the local list so it disappears from the dropdown.
      if (selectedProspectId) {
        const { error: updateErr } = await (supabase as any)
          .from('prospects')
          .update({ contact_status: 'onboarded' })
          .eq('id', selectedProspectId);
        if (updateErr) {
          // Non-fatal: package was created successfully even if prospect update failed
          toast({
            title: 'Prospect 상태 업데이트 실패 (패키지는 정상 추가됨)',
            description: String(updateErr.message),
            variant: 'destructive',
          });
        } else {
          setProspects((prev) => prev.filter((p) => p.id !== selectedProspectId));
        }
      }

      toast({
        title: '패키지 추가 완료',
        description: `${data.title} 등록됨. 메인 페이지엔 즉시, 카테고리·상세 페이지엔 재배포 후 반영`,
      });
      setForm(initialFormState);
      setSelectedProspectId('');

      // Auto-trigger redeploy if Deploy Hook URL is saved
      const url = window.localStorage.getItem(DEPLOY_HOOK_STORAGE_KEY);
      if (url) {
        await triggerRedeploy();
      }
    } catch (err: any) {
      toast({
        title: '추가 실패',
        description: String(err?.message || err),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deploy Hook Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            자동 재배포 설정 (1회만)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Vercel 대시보드 → Settings → Git → Deploy Hooks에서 만든 URL을 입력하세요.
            저장하면 이 브라우저에서 패키지 추가 시 자동으로 재배포됩니다.
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="https://api.vercel.com/v1/integrations/deploy/..."
              value={deployHookUrl}
              onChange={(e) => setDeployHookUrl(e.target.value)}
            />
            <Button onClick={saveDeployHook} variant={deployHookSaved ? 'outline' : 'default'}>
              {deployHookSaved ? '갱신' : '저장'}
            </Button>
          </div>
          {deployHookSaved && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>저장됨 — 패키지 추가 시 자동 재배포됩니다</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={triggerRedeploy}
            variant="outline"
            size="sm"
            disabled={!deployHookSaved || redeploying}
          >
            {redeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                재배포 트리거 중...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                지금 재배포 (수동)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prospect Picker — pre-fill form from a prospect-finder candidate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Prospect에서 시작 (선택)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            인스타에서 발굴한 작가 후보를 선택하면 제목·카테고리·설명·예약URL·폴더경로가 자동 입력됩니다.
            가격·썸네일·분위기 등 나머지는 직접 채워주세요. 패키지 추가 시 해당 prospect는 자동으로 'onboarded' 상태가 됩니다.
          </p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>후보 선택 ({prospects.length}명 대기 중)</Label>
              <Select value={selectedProspectId} onValueChange={applyProspectToForm}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingProspects ? '로딩 중...' : '신규 패키지 (prospect 없이)'} />
                </SelectTrigger>
                <SelectContent>
                  {prospects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      @{p.ig_username}
                      {p.ig_display_name ? ` · ${cleanProspectTitle(p.ig_display_name, p.ig_username)}` : ''}
                      {p.followers_count ? ` · ${p.followers_count.toLocaleString()} 팔로워` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadProspects} variant="outline" size="sm" disabled={loadingProspects}>
              {loadingProspects ? <Loader2 className="h-4 w-4 animate-spin" /> : '새로고침'}
            </Button>
          </div>
          {selectedProspectId && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                선택된 prospect의 데이터가 아래 폼에 적용되었습니다. 다른 후보로 바꾸려면 위에서 다시 선택하세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Package Form */}
      <Card>
        <CardHeader>
          <CardTitle>새 패키지 추가</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>제목 (작가/스튜디오명) *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 오르다스냅"
              />
            </div>
            <div>
              <Label>가격 (원) *</Label>
              <Input
                type="number"
                value={form.price_krw}
                onChange={(e) => setForm({ ...form, price_krw: e.target.value })}
                placeholder="120000"
              />
            </div>
            <div>
              <Label>예약 URL *</Label>
              <Input
                value={form.reservation_url}
                onChange={(e) => setForm({ ...form, reservation_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>촬영 시간 (분)</Label>
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                placeholder="60"
              />
            </div>
            <div className="md:col-span-2">
              <Label>썸네일 URL</Label>
              <Input
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="https://... 또는 packages/.../thumb.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Storage 업로드 후 URL을 복사해 붙여넣거나, Supabase Storage 경로 사용
              </p>
            </div>
          </div>

          {/* Occasions */}
          <div>
            <Label>카테고리 (occasions) * — 최소 1개</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {OCCASION_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.occasions.includes(opt)}
                    onCheckedChange={() => toggleArrayItem('occasions', opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <Label>분위기 (mood) — 선택사항</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {MOOD_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.mood.includes(opt)}
                    onCheckedChange={() => toggleArrayItem('mood', opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div>
            <Label>설명 (description, 짧은 한 줄 요약)</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="제주 자연 배경 가족 스냅 작가"
            />
          </div>

          <div>
            <Label>상세 (details, 긴 설명)</Label>
            <Textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="패키지 상세 설명, 포함 사항, 보정 컷 수 등"
              rows={6}
            />
          </div>

          <div>
            <Label>Tips (촬영 팁/배경/의상 추천)</Label>
            <Textarea
              value={form.Tips}
              onChange={(e) => setForm({ ...form, Tips: e.target.value })}
              placeholder="촬영용도/촬영배경/의상 가이드 등"
              rows={6}
            />
          </div>

          <div>
            <Label>폴더 경로 (folder_path, Storage 폴더명)</Label>
            <Input
              value={form.folder_path}
              onChange={(e) => setForm({ ...form, folder_path: e.target.value })}
              placeholder="예: oreuda-snap (선택)"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              * 필수 입력. 추가 후 메인엔 즉시 반영, 카테고리·상세 페이지엔 재배포 후 반영.
            </p>
            <Button onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  추가 중...
                </>
              ) : (
                '패키지 추가'
              )}
            </Button>
          </div>

          {lastInsertedTitle && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                마지막 추가: <strong>{lastInsertedTitle}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
