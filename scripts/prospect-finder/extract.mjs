#!/usr/bin/env node
/**
 * prospect-finder/extract: 인스타 프로필 스크린샷 → Claude vision 추출 → JSONL 누적
 *
 * 회사컴 단계. Supabase는 건드리지 않음.
 * 결과는 outputs/extracted_YYYY-MM-DD.jsonl 에 한 줄씩 append.
 * 이 파일을 git patch로 개인노트북에 옮긴 뒤 `npm run prospect:sync` 실행.
 *
 * Usage:
 *   npm run prospect:extract -- [--hashtag="#제주스냅"] [--dry-run] [--keep]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const execFileP = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- 설정 ----------
const MODEL = 'claude-opus-4-7';
const INPUTS_DIR = path.join(__dirname, 'inputs');
const PROCESSED_DIR = path.join(__dirname, 'processed');
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const SUPPORTED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const EXT_TO_MEDIA_TYPE = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

// Anthropic limits base64-encoded payload to 5 MB. Base64 ≈ raw × 1.37 (with newlines).
// Stay safely under by triggering recompression when raw exceeds ~3.6 MB.
const MAX_RAW_BYTES_BEFORE_RECOMPRESS = 3.6 * 1024 * 1024;
const MAX_RAW_BYTES_HARD = 4.8 * 1024 * 1024; // post-compression ceiling

// Recompress oversized images to JPEG via macOS `sips`. Tries q=85, then q=70.
// Returns the buffer + media type that should actually be sent.
async function prepareImageForUpload(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let mediaType = EXT_TO_MEDIA_TYPE[ext];
  if (!mediaType) throw new Error(`지원하지 않는 확장자: ${ext}`);

  let buf = await fs.readFile(filePath);
  if (buf.length <= MAX_RAW_BYTES_BEFORE_RECOMPRESS) {
    return { buffer: buf, mediaType, recompressed: false, quality: null };
  }

  // Recompress to a temp JPEG. Try q=85 first, fall back to q=70.
  const tmpBase = path.join(os.tmpdir(), `prospect-${process.pid}-${Date.now()}`);
  for (const quality of [85, 70]) {
    const tmpOut = `${tmpBase}-q${quality}.jpg`;
    try {
      await execFileP('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), filePath, '--out', tmpOut]);
      const compressed = await fs.readFile(tmpOut);
      await fs.unlink(tmpOut).catch(() => {});
      if (compressed.length <= MAX_RAW_BYTES_HARD) {
        return { buffer: compressed, mediaType: 'image/jpeg', recompressed: true, quality };
      }
      buf = compressed; // remember last attempt for error message
    } catch (e) {
      await fs.unlink(tmpOut).catch(() => {});
      throw new Error(`sips 압축 실패 (q=${quality}): ${e.message}`);
    }
  }
  throw new Error(
    `원본이 너무 커서 5MB 한도에 맞출 수 없음 (q=70 기준 ${(buf.length / 1024 / 1024).toFixed(1)}MB). 스크린샷 해상도를 줄여 다시 찍어보세요.`,
  );
}

// ---------- CLI 파싱 ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=').replace(/^["']|["']$/g, '') : null;
};
const HASHTAG = opt('hashtag');
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
  } catch {
    // .env 없어도 OK
  }
}

await loadEnv();

const { ANTHROPIC_API_KEY } = process.env;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY가 .env에 없습니다.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ---------- 프롬프트 ----------
const SYSTEM_PROMPT = `당신은 인스타그램 프로필 스크린샷에서 구조화 데이터를 추출하는 OCR 어시스턴트입니다.

목표: 제주 스냅 사진작가 발굴을 위해 프로필 헤더 정보를 정확히 읽어내는 것.

출력은 **반드시 단일 JSON 객체** 만 반환하세요. 설명 텍스트나 코드블록 마커(\`\`\`) 없이 순수 JSON만.

스키마:
{
  "ig_username": "string (필수, @ 제외)",
  "ig_display_name": "string | null (프로필 이름, 보통 username 아래 굵게)",
  "followers_count": "integer | null (팔로워 수, '1.2만'은 12000, '5,432'는 5432)",
  "following_count": "integer | null (팔로잉 수)",
  "posts_count": "integer | null (게시물 수)",
  "bio": "string | null (바이오 전체 텍스트, 줄바꿈 \\n 유지)",
  "external_link": "string | null (바이오 아래 단일 외부 링크, 없으면 null)",
  "has_smartstore_link": "boolean (바이오/링크에 smartstore/네이버스토어 언급)",
  "has_naver_booking_link": "boolean (바이오/링크에 booking.naver/네이버예약 언급)",
  "has_kakao_link": "boolean (바이오에 카톡/오픈채팅/pf.kakao 언급)",
  "has_dm_only": "boolean (바이오에 'DM문의' '디엠' '쪽지' 등 DM-only 언급)",
  "shoot_styles": "array of string (다음 중 일치하는 것만: '커플', '가족', '우정', '프로필', '웨딩', '만삭'. 바이오에서 추정)",
  "shoot_region": "string | null ('제주', '서울', '부산' 등 바이오/태그에서 추정)",
  "confidence": "number 0.0~1.0 (스크린샷 품질 + 추출 자신도)"
}

규칙:
- 스크린샷이 인스타 프로필 헤더가 아니거나 username을 못 읽으면 {"error": "이유"} 만 반환.
- 숫자 변환 시 단위 명시 ('1.2만' → 12000, '1.5K' → 1500, '5,432' → 5432).
- 바이오에 명시 안 된 정보는 추측하지 말고 null.
- shoot_styles는 enum 매칭만 — 한국어 표기 그대로.`;

const USER_PROMPT = (hashtagHint) =>
  `이 인스타그램 프로필 스크린샷에서 데이터를 추출해주세요.${
    hashtagHint ? ` (발견 출처: ${hashtagHint})` : ''
  } JSON 객체만 반환.`;

// ---------- 핵심 로직 ----------
async function extractFromImage(filePath, hashtag) {
  const { buffer: buf, mediaType, recompressed, quality } = await prepareImageForUpload(filePath);
  if (recompressed) {
    console.log(`  🗜️  자동 압축 적용 (sips JPEG q=${quality}, ${(buf.length / 1024).toFixed(0)} KB)`);
  }
  const base64 = buf.toString('base64');

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: USER_PROMPT(hashtag) },
        ],
      },
    ],
  });

  const textBlock = resp.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('Claude 응답에 text 블록 없음');

  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON 파싱 실패: ${e.message}\n원본: ${raw.slice(0, 200)}`);
  }
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function appendJsonl(record) {
  await fs.mkdir(OUTPUTS_DIR, { recursive: true });
  const file = path.join(OUTPUTS_DIR, `extracted_${todayStamp()}.jsonl`);
  await fs.appendFile(file, JSON.stringify(record) + '\n', 'utf8');
  return file;
}

async function main() {
  console.log('🔍 prospect-finder / extract (회사컴 단계)');
  console.log(`   모델: ${MODEL}`);
  console.log(`   해시태그: ${HASHTAG ?? '(미지정)'}`);
  console.log(`   dry-run: ${DRY_RUN}`);
  console.log('');

  await fs.mkdir(INPUTS_DIR, { recursive: true });
  await fs.mkdir(PROCESSED_DIR, { recursive: true });

  const files = (await fs.readdir(INPUTS_DIR))
    .filter((f) => SUPPORTED_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log(`⚠️  ${INPUTS_DIR}에 스크린샷이 없습니다.`);
    return;
  }

  console.log(`📂 처리할 파일 ${files.length}개\n`);

  const stats = { ok: 0, skip: 0, fail: 0 };
  let outFile = null;

  for (const file of files) {
    const filePath = path.join(INPUTS_DIR, file);
    console.log(`▶ ${file}`);

    try {
      const extracted = await extractFromImage(filePath, HASHTAG);

      if (extracted.error) {
        console.log(`  ⚠️  스킵 (${extracted.error})`);
        stats.skip++;
        continue;
      }
      if (!extracted.ig_username) {
        console.log(`  ⚠️  ig_username 누락, 스킵`);
        stats.skip++;
        continue;
      }

      const record = {
        extracted_at: new Date().toISOString(),
        screenshot_file: file,
        hashtag_source: HASHTAG ?? null,
        data: extracted,
      };

      if (DRY_RUN) {
        console.log(`  📝 [dry-run] @${extracted.ig_username} (팔로워 ${extracted.followers_count ?? '?'})`);
      } else {
        outFile = await appendJsonl(record);
        console.log(`  ✅ @${extracted.ig_username} (팔로워 ${extracted.followers_count ?? '?'}) → ${path.basename(outFile)}`);
        if (!KEEP) {
          await fs.rename(filePath, path.join(PROCESSED_DIR, file));
        }
      }
      stats.ok++;
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
      stats.fail++;
    }
  }

  console.log('');
  console.log(`📊 완료: 성공 ${stats.ok} / 스킵 ${stats.skip} / 실패 ${stats.fail}`);
  if (!DRY_RUN && outFile) {
    console.log(`   → ${path.relative(process.cwd(), outFile)}`);
    console.log(`   다음 단계 (개인노트북): git pull && npm run prospect:sync`);
  }
}

main().catch((e) => {
  console.error('💥 실행 실패:', e);
  process.exit(1);
});
