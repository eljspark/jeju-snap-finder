#!/usr/bin/env node
/**
 * prospect-finder/discover: 해시태그 → 후보 username 리스트 + 가격 공개 여부 필터
 *
 * 워크플로우:
 *   1. Apify instagram-hashtag-scraper로 해시태그에서 최근 게시물 N개 가져오기
 *   2. ownerUsername 기준 dedupe → 고유 작가 리스트
 *   3. 각 작가에 대해 Apify instagram-profile-scraper(라이트)로 bio + externalUrl 가져오기
 *   4. 가격 공개 여부 체크 (2-tier):
 *      - Tier A: bio + 최근 캡션 정규식 매칭 ("100,000원", "10만원", "₩100,000")
 *      - Tier B: externalUrl 페이지 fetch → 텍스트 추출 → Claude Sonnet으로 가격 추출
 *   5. 콘솔 테이블 + outputs/discovered_<hashtag>_<date>.txt 작성
 *      (✅ 후보는 uncomment, ❌ 후보는 #로 코멘트 처리)
 *
 * 그 다음:
 *   npm run prospect:scrape -- --usernames-file=outputs/discovered_<...>.txt
 *
 * Usage:
 *   npm run prospect:discover -- --hashtag="#제주가족스냅" [--limit=50] [--no-tier-b]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const HASHTAG_ACTOR = 'apify~instagram-hashtag-scraper';
const PROFILE_ACTOR = 'apify~instagram-profile-scraper';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

// ---------- CLI ----------
const args = process.argv.slice(2);
const opt = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=').replace(/^["']|["']$/g, '') : null;
};
const flag = (name) => args.includes(`--${name}`);

const HASHTAG = opt('hashtag');
const LIMIT = Number(opt('limit') ?? '50');
const SKIP_TIER_B = flag('no-tier-b');
const INCLUDE_EXISTING = flag('include-existing');

if (!HASHTAG) {
  console.error('❌ --hashtag="#제주가족스냅" 필수');
  process.exit(1);
}

const hashtagClean = HASHTAG.replace(/^#/, '');

// ---------- 환경변수 ----------
async function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
}

await loadEnv();

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || process.env.APIFY_API_KEY;
if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN(또는 APIFY_API_KEY)가 .env에 없습니다.');
  process.exit(1);
}

const { ANTHROPIC_API_KEY } = process.env;
const anthropic = ANTHROPIC_API_KEY && !SKIP_TIER_B ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
if (!anthropic && !SKIP_TIER_B) {
  console.warn('⚠️  ANTHROPIC_API_KEY 없음 — Tier B (외부링크 가격 확인) 스킵됨');
}

// ---------- 기존 작가 (Supabase) ----------
const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = process.env;
const SUPABASE_AVAILABLE = !!(VITE_SUPABASE_URL && VITE_SUPABASE_PUBLISHABLE_KEY);

async function fetchKnownUsernames() {
  if (!SUPABASE_AVAILABLE) {
    console.warn('⚠️  VITE_SUPABASE_URL/KEY 없음 — 기존 작가 필터 스킵');
    return new Set();
  }
  const headers = {
    apikey: VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}`,
  };
  const known = new Set();
  try {
    const pRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/prospects?select=ig_username`, { headers });
    if (pRes.ok) {
      const rows = await pRes.json();
      for (const r of rows) if (r.ig_username) known.add(r.ig_username.toLowerCase());
    }
  } catch {}
  try {
    const kRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/packages?select=folder_path`, { headers });
    if (kRes.ok) {
      const rows = await kRes.json();
      for (const r of rows) {
        const fp = r.folder_path;
        if (!fp) continue;
        const last = fp.split('/').pop();
        // Heuristic: take folder_path tail only if it looks like an IG handle (not a UUID)
        if (last && /^[a-zA-Z0-9._]{2,30}$/.test(last) && !/^[0-9a-f]{8}-/.test(last)) {
          known.add(last.toLowerCase());
        }
      }
    }
  } catch {}
  return known;
}

// ---------- Apify 호출 ----------
async function callApify(actor, input) {
  const endpoint = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apify ${actor} ${res.status}: ${errText.slice(0, 300)}`);
  }
  return res.json();
}

// ---------- Tier A: bio + 캡션 정규식 ----------
const PRICE_PATTERNS = [
  /([0-9]{1,3}(?:,[0-9]{3})+)\s*원/, // "100,000원"
  /([0-9]+(?:\.[0-9]+)?)\s*만원/, // "10만원"
  /₩\s*([0-9]{1,3}(?:,[0-9]{3})*)/, // "₩100,000"
];

function checkPricingTierA(profile) {
  const texts = [
    profile.biography || '',
    ...(profile.latestPosts || []).slice(0, 3).map((p) => p.caption || ''),
  ];
  const combined = texts.join('\n');

  for (const re of PRICE_PATTERNS) {
    const m = combined.match(re);
    if (m) {
      const idx = combined.indexOf(m[0]);
      const snippet = combined
        .slice(Math.max(0, idx - 25), Math.min(combined.length, idx + m[0].length + 25))
        .replace(/\s+/g, ' ')
        .trim();
      return { found: true, source: 'bio/caption', snippet };
    }
  }
  return { found: false };
}

// ---------- Tier B: 외부링크 fetch + Claude ----------
async function checkPricingTierB(profile) {
  const url = profile.externalUrl;
  if (!url || !anthropic) return { found: false, source: null, snippet: null, note: null };

  let html;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return { found: false, source: null, snippet: null, note: `link HTTP ${res.status}` };
    }
    html = await res.text();
  } catch (e) {
    return { found: false, source: null, snippet: null, note: `link fetch: ${e.message.slice(0, 50)}` };
  }

  // 시각 텍스트만 거칠게 추출 (HTML 태그 제거)
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  if (text.length < 50) {
    return { found: false, source: null, snippet: null, note: 'link page empty' };
  }

  try {
    const resp = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 250,
      system: '당신은 사진작가 웹페이지에서 가격 정보를 추출하는 도구입니다. JSON만 반환하세요.',
      messages: [
        {
          role: 'user',
          content: `사진작가의 외부 링크 페이지 텍스트입니다:\n\n${text}\n\n다음 JSON을 정확히 반환하세요 (다른 텍스트 절대 금지):\n{\n  "has_pricing": boolean,\n  "snippet": "구체적인 가격이 포함된 짧은 인용 (한 줄, 최대 80자) 또는 null",\n  "estimated_min_krw": integer | null\n}\n\nhas_pricing은 **사진 촬영 서비스 가격이 KRW로 명시되어 있을 때만 true**. 일반 상품 가격이나 후기는 false. JSON만 출력.`,
        },
      ],
    });

    const raw = resp.content
      .find((b) => b.type === 'text')
      ?.text?.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    if (!raw) return { found: false, source: null, snippet: null, note: 'claude empty' };

    const parsed = JSON.parse(raw);
    if (parsed.has_pricing && parsed.snippet) {
      return {
        found: true,
        source: 'external_link',
        snippet: String(parsed.snippet).slice(0, 80),
        estimated_min_krw: parsed.estimated_min_krw ?? null,
      };
    }
    return { found: false, source: null, snippet: null, note: null };
  } catch (e) {
    return { found: false, source: null, snippet: null, note: `claude: ${e.message.slice(0, 50)}` };
  }
}

// ---------- 메인 ----------
async function main() {
  console.log('🔍 prospect-finder / discover');
  console.log(`   hashtag: ${HASHTAG}`);
  console.log(`   hashtag scraper limit: ${LIMIT} 게시물`);
  console.log(`   Tier B (외부링크 Claude 추출): ${anthropic ? 'on' : 'off'}`);
  console.log('');

  // 1. Hashtag scrape
  console.log(`📦 Apify hashtag scraper 호출 중...`);
  let posts;
  try {
    posts = await callApify(HASHTAG_ACTOR, {
      hashtags: [hashtagClean],
      resultsLimit: LIMIT,
      resultsType: 'posts',
    });
  } catch (e) {
    console.error(`💥 ${e.message}`);
    process.exit(1);
  }
  console.log(`   → ${posts.length}개 게시물 반환`);

  // 2. Dedupe by ownerUsername
  const usernameMap = new Map();
  for (const p of posts) {
    const u = p.ownerUsername;
    if (!u || usernameMap.has(u)) continue;
    usernameMap.set(u, {
      postsFromHashtag: 1,
      // Apify hashtag scraper에 따라 일부 메타가 같이 옴 (ownerFullName 등)
      seenFullName: p.ownerFullName,
    });
  }
  // 이미 봤어도 카운트는 증가
  for (const p of posts) {
    if (p.ownerUsername && usernameMap.has(p.ownerUsername)) {
      usernameMap.get(p.ownerUsername).postsFromHashtag++;
    }
  }
  const allCandidates = [...usernameMap.keys()];
  console.log(`   → ${allCandidates.length}명의 고유 작가 발견`);

  // 2b. 기존 prospects/packages에 있는 작가 필터링 (--include-existing로 비활성화)
  let candidates = allCandidates;
  let skippedExisting = [];
  if (!INCLUDE_EXISTING) {
    const known = await fetchKnownUsernames();
    if (known.size > 0) {
      skippedExisting = allCandidates.filter((u) => known.has(u.toLowerCase()));
      candidates = allCandidates.filter((u) => !known.has(u.toLowerCase()));
      console.log(`   → 기존 작가 ${skippedExisting.length}명 제외 (${candidates.length}명 신규)`);
      if (skippedExisting.length > 0 && skippedExisting.length <= 10) {
        console.log(`     스킵된 작가: ${skippedExisting.map((u) => '@' + u).join(', ')}`);
      }
    }
  } else {
    console.log(`   → --include-existing: 기존 작가 필터 비활성화`);
  }
  console.log('');

  if (candidates.length === 0) {
    console.log('⚠️  Apify에 보낼 신규 후보가 없습니다 (모두 기존 작가).');
    return;
  }

  // 3. Profile scrape for each
  console.log(`📦 Apify profile scraper 호출 중 (${candidates.length}명)...`);
  let profiles;
  try {
    profiles = await callApify(PROFILE_ACTOR, { usernames: candidates });
  } catch (e) {
    console.error(`💥 ${e.message}`);
    process.exit(1);
  }
  console.log(`   → ${profiles.length}개 프로필 반환`);
  console.log('');

  // 4. Pricing check
  console.log(`💰 가격 공개 여부 확인 중...`);
  const results = [];
  for (const profile of profiles) {
    const username = profile.username;
    if (!username) continue;

    let pricing = checkPricingTierA(profile);
    if (!pricing.found && anthropic) {
      pricing = await checkPricingTierB(profile);
    }
    results.push({
      username,
      fullName: profile.fullName || '',
      followersCount: profile.followersCount ?? 0,
      externalUrl: profile.externalUrl || '',
      bio: (profile.biography || '').slice(0, 60),
      pricing,
    });
    const tag = pricing.found ? '✅' : '❌';
    const detail = pricing.found
      ? `${pricing.snippet} (${pricing.source})`
      : pricing.note || 'no pricing';
    console.log(`   ${tag} @${username.padEnd(22)} ${detail}`);
  }
  console.log('');

  // Sort: pricing-found first, then by follower count desc
  results.sort((a, b) => {
    if (a.pricing.found !== b.pricing.found) return a.pricing.found ? -1 : 1;
    return (b.followersCount || 0) - (a.followersCount || 0);
  });

  // 5. 콘솔 테이블
  console.log('📊 결과 요약:\n');
  const ok = results.filter((r) => r.pricing.found).length;
  const no = results.length - ok;
  console.log(`   ✅ 가격 공개: ${ok}명`);
  console.log(`   ❌ 가격 미공개: ${no}명`);
  console.log('');

  console.log('  STATUS  USERNAME                  FOLLOWERS  PRICING');
  for (const r of results) {
    const status = r.pricing.found ? '✅' : '❌';
    const snippet = r.pricing.found
      ? `"${r.pricing.snippet}" (${r.pricing.source})`
      : r.pricing.note || '-';
    const followers = (r.followersCount || 0).toLocaleString();
    console.log(`  ${status}      @${r.username.padEnd(24)} ${followers.padStart(7)}    ${snippet.slice(0, 70)}`);
  }
  console.log('');

  // 6. .txt 파일 작성
  await fs.mkdir(OUTPUTS_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const safeName = hashtagClean.replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const outFile = path.join(OUTPUTS_DIR, `discovered_${safeName}_${today}.txt`);

  const lines = [
    `# discovered ${today} hashtag=${HASHTAG}`,
    `# ${results.length} candidates evaluated, ${ok} with visible pricing`,
    `# ✅ = uncomment to scrape, ❌ = commented out (manually uncomment if you want)`,
    `# Pipe to: npm run prospect:scrape -- --usernames-file=${path.relative(process.cwd(), outFile)}`,
    '',
  ];
  for (const r of results) {
    const tag = r.pricing.found ? '✅' : '❌';
    const detail = r.pricing.found
      ? `${r.pricing.snippet} (${r.pricing.source})`
      : r.pricing.note || 'no pricing';
    const followers = r.followersCount ? ` (${r.followersCount.toLocaleString()} followers)` : '';
    if (r.pricing.found) {
      lines.push(`${r.username}  # ${tag} ${detail}${followers}`);
    } else {
      lines.push(`# ${r.username}  # ${tag} ${detail}${followers}`);
    }
  }
  await fs.writeFile(outFile, lines.join('\n') + '\n', 'utf8');
  console.log(`📄 → ${path.relative(process.cwd(), outFile)} 작성됨`);
  console.log(`   다음 단계: npm run prospect:scrape -- --usernames-file=${path.relative(process.cwd(), outFile)} --hashtag="${HASHTAG}"`);
}

main().catch((e) => {
  console.error('💥 실행 실패:', e);
  process.exit(1);
});
