#!/usr/bin/env node
/**
 * prospect-finder/sync: outputs/*.jsonl → Supabase prospects 테이블 upsert
 *
 * 개인노트북 단계. Anthropic API는 건드리지 않음.
 * 회사컴에서 git patch로 옮긴 outputs/extracted_*.jsonl 파일들을 한 번에 적재.
 *
 * Usage:
 *   npm run prospect:sync -- [--dry-run] [--keep]
 *
 * 처리된 파일은 outputs/synced/ 로 이동 (--keep으로 비활성화 가능).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const SYNCED_DIR = path.join(OUTPUTS_DIR, 'synced');

// ---------- CLI ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const DRY_RUN = flag('dry-run');
const KEEP = flag('keep');

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

const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = process.env;
if (!DRY_RUN && (!VITE_SUPABASE_URL || !VITE_SUPABASE_PUBLISHABLE_KEY)) {
  console.error('❌ VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY가 .env에 없습니다.');
  process.exit(1);
}

const supabase = DRY_RUN
  ? null
  : createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

// ---------- 변환 ----------
function buildNaverSearchUrls(username, displayName) {
  // Strip noise after the first pipe ('|' or fullwidth '｜'). For
  // "언트하우스 제주만삭스냅 | 제주도가족사진 ..." we just want "언트하우스 제주만삭스냅".
  const cleanName = (displayName || '').split(/[|｜]/)[0].trim() || username;
  const buildUrl = (suffix) =>
    `https://search.naver.com/search.naver?query=${encodeURIComponent(`${cleanName} ${suffix}`)}`;
  return {
    booking: buildUrl('예약'),
    smartstore: buildUrl('스마트스토어'),
  };
}

function recordToRow(record) {
  const d = record.data;
  if (!d || !d.ig_username) return null;

  const naverUrls = buildNaverSearchUrls(d.ig_username, d.ig_display_name);

  return {
    ig_username: d.ig_username.replace(/^@/, ''),
    ig_display_name: d.ig_display_name ?? null,
    followers_count: d.followers_count ?? null,
    following_count: d.following_count ?? null,
    posts_count: d.posts_count ?? null,
    bio: d.bio ?? null,
    external_link: d.external_link ?? null,
    has_smartstore_link: !!d.has_smartstore_link,
    has_naver_booking_link: !!d.has_naver_booking_link,
    has_kakao_link: !!d.has_kakao_link,
    has_dm_only: !!d.has_dm_only,
    hashtag_source: record.hashtag_source ?? null,
    shoot_styles: Array.isArray(d.shoot_styles) ? d.shoot_styles : [],
    shoot_region: d.shoot_region ?? null,
    naver_booking_search_url: naverUrls.booking,
    naver_smartstore_search_url: naverUrls.smartstore,
    source_screenshot_path: record.screenshot_file ?? null,
    raw_extraction: d,
  };
}

async function readJsonl(file) {
  const raw = await fs.readFile(file, 'utf8');
  const records = [];
  for (const [i, line] of raw.split('\n').entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      records.push(JSON.parse(trimmed));
    } catch (e) {
      console.log(`  ⚠️  ${path.basename(file)}:${i + 1} 파싱 실패, 스킵`);
    }
  }
  return records;
}

async function main() {
  console.log('📤 prospect-finder / sync (개인노트북 단계)');
  console.log(`   dry-run: ${DRY_RUN}`);
  console.log('');

  await fs.mkdir(OUTPUTS_DIR, { recursive: true });
  await fs.mkdir(SYNCED_DIR, { recursive: true });

  const files = (await fs.readdir(OUTPUTS_DIR))
    .filter((f) => f.endsWith('.jsonl'))
    .sort();

  if (files.length === 0) {
    console.log(`⚠️  ${OUTPUTS_DIR}에 .jsonl 파일이 없습니다.`);
    return;
  }

  console.log(`📂 처리할 jsonl 파일 ${files.length}개\n`);

  const stats = { ok: 0, skip: 0, fail: 0 };

  for (const file of files) {
    const filePath = path.join(OUTPUTS_DIR, file);
    const records = await readJsonl(filePath);
    console.log(`▶ ${file} (${records.length} 레코드)`);

    let fileOk = 0;
    let fileFail = 0;

    for (const record of records) {
      const row = recordToRow(record);
      if (!row) {
        console.log(`  ⚠️  스킵 (ig_username 없음)`);
        stats.skip++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  📝 [dry-run] @${row.ig_username} (팔로워 ${row.followers_count ?? '?'})`);
        stats.ok++;
        fileOk++;
        continue;
      }

      const { error } = await supabase
        .from('prospects')
        .upsert(row, { onConflict: 'ig_username', ignoreDuplicates: false });

      if (error) {
        console.log(`  ❌ @${row.ig_username}: ${error.message}`);
        stats.fail++;
        fileFail++;
      } else {
        console.log(`  ✅ @${row.ig_username}`);
        stats.ok++;
        fileOk++;
      }
    }

    // 파일 내 전부 성공한 경우에만 synced/로 이동
    if (!DRY_RUN && !KEEP && fileFail === 0 && fileOk > 0) {
      await fs.rename(filePath, path.join(SYNCED_DIR, file));
      console.log(`  → synced/${file} 로 이동`);
    } else if (fileFail > 0) {
      console.log(`  ⚠️  ${fileFail}건 실패, 파일은 outputs/에 유지`);
    }
  }

  console.log('');
  console.log(`📊 완료: 성공 ${stats.ok} / 스킵 ${stats.skip} / 실패 ${stats.fail}`);
}

main().catch((e) => {
  console.error('💥 실행 실패:', e);
  process.exit(1);
});
