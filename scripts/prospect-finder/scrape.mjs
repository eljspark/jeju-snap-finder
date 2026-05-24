#!/usr/bin/env node
/**
 * prospect-finder/scrape: Apify Instagram Profile Scraper → inputs/<username>/{info.json, 01.jpg, 02.jpg, ...}
 *
 * 회사컴 단계. Anthropic을 안 쓰는 대신 Apify API를 씀.
 * 결과는 extract.mjs가 info.json을 직접 소비할 수 있게 정리되어 저장됨 (OCR 스킵).
 *
 * Usage:
 *   npm run prospect:scrape -- --username=dongwanfilm
 *   npm run prospect:scrape -- --usernames=foo,bar,baz
 *   npm run prospect:scrape -- --usernames-file=./scouting.txt
 *   npm run prospect:scrape -- --username=foo --hashtag="#제주스냅" --max-images=60
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUTS_DIR = path.join(__dirname, 'inputs');
const APIFY_ACTOR = 'apify~instagram-profile-scraper';

// ---------- CLI 파싱 ----------
const args = process.argv.slice(2);
const opt = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=').replace(/^["']|["']$/g, '') : null;
};

const usernameArg = opt('username');
const usernamesArg = opt('usernames');
const usernamesFileArg = opt('usernames-file');
const HASHTAG = opt('hashtag');
const MAX_IMAGES = Number(opt('max-images') ?? '80');

// ---------- 환경변수 ----------
async function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (m) {
        const [, key, val] = m;
        if (!process.env[key]) {
          process.env[key] = val.replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch {}
}

await loadEnv();

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || process.env.APIFY_API_KEY;
if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN(또는 APIFY_API_KEY)가 .env에 없습니다.');
  console.error('   https://console.apify.com/settings/integrations 에서 토큰을 만든 뒤 .env에 추가:');
  console.error('   APIFY_API_TOKEN="apify_api_..."');
  process.exit(1);
}

// ---------- usernames 수집 ----------
let usernames = [];
if (usernameArg) {
  usernames = [usernameArg];
} else if (usernamesArg) {
  usernames = usernamesArg.split(',').map((s) => s.trim()).filter(Boolean);
} else if (usernamesFileArg) {
  const raw = await fs.readFile(usernamesFileArg, 'utf8');
  usernames = raw.split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
}

if (usernames.length === 0) {
  console.error('❌ --username=<name>, --usernames=foo,bar, or --usernames-file=<path> 중 하나는 필수');
  process.exit(1);
}

usernames = usernames.map((u) => u.replace(/^@/, ''));

// ---------- 헬퍼 ----------
function inferFieldsFromBio(bio, externalUrl) {
  const bioStr = bio || '';
  const text = `${bioStr} ${externalUrl || ''}`.toLowerCase();

  const has_smartstore_link = /smartstore|네이버스토어|스마트스토어/.test(text);
  const has_naver_booking_link = /booking\.naver|네이버예약|네이버 예약/.test(text);
  const has_kakao_link = /kakao|카톡|오픈채팅|pf\.kakao/.test(text);
  const has_dm_only =
    /(dm문의|디엠|쪽지)/i.test(bioStr) && !has_kakao_link && !has_naver_booking_link;

  const SHOOT_KEYWORDS = ['커플', '가족', '우정', '프로필', '웨딩', '만삭'];
  const shoot_styles = SHOOT_KEYWORDS.filter((k) => bioStr.includes(k));

  const REGION_KEYWORDS = ['제주', '서울', '부산', '경주', '강원'];
  const shoot_region = REGION_KEYWORDS.find((r) => bioStr.includes(r)) || null;

  return { has_smartstore_link, has_naver_booking_link, has_kakao_link, has_dm_only, shoot_styles, shoot_region };
}

async function callApify(usernames) {
  const endpoint = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apify ${res.status}: ${errText.slice(0, 400)}`);
  }
  return res.json();
}

function pickImageUrls(profile, maxImages) {
  const urls = [];
  for (const post of profile.latestPosts || []) {
    if (post.childPosts && post.childPosts.length > 0) {
      // Carousel — collect Image children only (skip videos)
      for (const child of post.childPosts) {
        if (child.type === 'Image' && child.displayUrl) {
          urls.push(child.displayUrl);
          if (urls.length >= maxImages) return urls;
        }
      }
    } else if (post.type === 'Image' && post.displayUrl) {
      urls.push(post.displayUrl);
      if (urls.length >= maxImages) return urls;
    }
    // type 'Video' top-level: skip (displayUrl would be video thumbnail)
  }
  return urls;
}

async function downloadImage(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
  return buf.length;
}

async function processProfile(profile, hashtag) {
  const username = profile.username;
  if (!username) {
    console.log('  ⚠️  username 없는 결과, 스킵');
    return null;
  }

  const dir = path.join(INPUTS_DIR, username);
  await fs.mkdir(dir, { recursive: true });

  const inferred = inferFieldsFromBio(profile.biography, profile.externalUrl);

  // OCR 결과와 같은 shape (extract.mjs / sync.mjs가 그대로 소비)
  const data = {
    ig_username: username,
    ig_display_name: profile.fullName ?? null,
    followers_count: profile.followersCount ?? null,
    following_count: profile.followsCount ?? null,
    posts_count: profile.postsCount ?? null,
    bio: profile.biography ?? null,
    external_link: profile.externalUrl ?? null,
    ...inferred,
    confidence: 1.0,
  };

  // 이미지 다운로드
  const urls = pickImageUrls(profile, MAX_IMAGES);
  console.log(`  📸 ${urls.length}장 발견 → 다운로드 시작`);

  let downloadedBytes = 0;
  let okCount = 0;
  for (const [i, url] of urls.entries()) {
    const idx = String(i + 1).padStart(2, '0');
    const outPath = path.join(dir, `${idx}.jpg`);
    try {
      const bytes = await downloadImage(url, outPath);
      downloadedBytes += bytes;
      okCount++;
    } catch (e) {
      console.log(`  ⚠️  ${idx}.jpg 실패: ${e.message}`);
    }
  }
  console.log(`  💾 ${okCount}/${urls.length}장 저장 (${(downloadedBytes / 1024 / 1024).toFixed(1)}MB)`);

  // info.json — extract.mjs가 OCR 없이 그대로 소비할 수 있는 형식
  const record = {
    extracted_at: new Date().toISOString(),
    source: 'apify-profile-scraper',
    hashtag_source: hashtag ?? null,
    data,
    image_count: okCount,
  };
  await fs.writeFile(path.join(dir, 'info.json'), JSON.stringify(record, null, 2), 'utf8');

  return record;
}

async function main() {
  console.log('🕷️  prospect-finder / scrape (Apify API)');
  console.log(`   actor: ${APIFY_ACTOR}`);
  console.log(`   usernames (${usernames.length}): ${usernames.join(', ')}`);
  console.log(`   해시태그: ${HASHTAG ?? '(미지정)'}`);
  console.log(`   max-images per profile: ${MAX_IMAGES}`);
  console.log('');

  await fs.mkdir(INPUTS_DIR, { recursive: true });

  let profiles;
  try {
    profiles = await callApify(usernames);
  } catch (e) {
    console.error(`💥 Apify 호출 실패: ${e.message}`);
    process.exit(1);
  }

  console.log(`📦 Apify 반환: ${profiles.length}개 프로필\n`);

  let ok = 0;
  for (const profile of profiles) {
    console.log(`▶ @${profile.username || '?'}`);
    const result = await processProfile(profile, HASHTAG);
    if (result) {
      console.log(`  ✅ inputs/${profile.username}/info.json + ${result.image_count}장 저장`);
      ok++;
    }
  }

  console.log('');
  console.log(`📊 완료: ${ok}/${profiles.length} 프로필`);
  console.log(`   다음 단계: npm run prospect:extract  (info.json은 OCR 없이 직접 소비됨)`);
}

main().catch((e) => {
  console.error('💥 실행 실패:', e);
  process.exit(1);
});
