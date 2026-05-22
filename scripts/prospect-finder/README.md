# prospect-finder

제주 스냅 작가 후보를 인스타 스크린샷에서 Claude vision으로 추출 → Supabase `prospects` 테이블에 적재하는 워크플로우.

Apify 같은 유료 스크래퍼 없이 **수동 스크린샷 + AI OCR** 조합으로 운영합니다.

---

## 회사컴 ↔ 개인노트북 분리 설계

Supabase 접근은 개인 계정이라 회사컴에서 안 됨. 그래서 **추출과 적재를 두 단계로 분리**합니다.

```
[회사컴]
  ① 인스타 스크린샷 수집 → inputs/
  ② npm run prospect:extract
     → Claude vision OCR
     → outputs/extracted_YYYY-MM-DD.jsonl 에 append
  ③ git commit + format-patch → patch 파일을 개인노트북으로 전송

[개인노트북]
  ④ patch 적용 (git am)
  ⑤ npm run prospect:sync
     → outputs/*.jsonl → Supabase prospects 테이블 upsert
     → 끝난 파일은 outputs/synced/ 로 이동 (gitignore됨)
  ⑥ git push
  ⑦ (필요시) Supabase Studio에서 naver_status, contact_status 수동 갱신
```

회사컴은 **Anthropic API만** 호출, 개인노트북은 **Supabase만** 호출.

---

## 1회만 셋업 (개인노트북에서)

### 1. Supabase 마이그레이션

`supabase/migrations/20260519000000_prospects.sql` 내용을 Supabase Studio SQL Editor에 붙여넣고 실행.

생성되는 것:
- `prospects` 테이블 (인스타 데이터 + 네이버 검색 URL + 컨택 상태)
- `prospect_contact_status` enum (new / contacted / replied / onboarded / rejected / unfit)
- `prospect_naver_status` enum (unchecked / not_registered / booking_only / smartstore_only / both)
- 인덱스 3개, RLS 정책 (public r/w — 추후 인증 붙이면 좁힐 것)

### 2. 환경변수

`.env`에 다음 추가 (회사컴·개인노트북 각각):

```
# 회사컴 (extract용)
ANTHROPIC_API_KEY="sk-ant-..."

# 개인노트북 (sync용) — 이미 jeju-snap-finder가 쓰고 있음
VITE_SUPABASE_URL="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
```

---

## 매 배치 운영 (반복)

### 회사컴: 스크린샷 수집 + 추출

#### (a) 인스타 스크린샷 찍기

추천 해시태그:
- `#제주스냅` `#제주스냅작가`
- `#제주커플스냅` `#제주웨딩스냅`
- `#제주우정스냅` `#제주가족스냅` `#제주프로필`
- 지역: `#한담해변스냅` `#협재스냅` `#월정리스냅`

**좋은 스크린샷**:
- 프로필 헤더가 명확히 보이게 (@username + 게시물/팔로워/팔로잉 + 이름 + 바이오 + 링크)
- 가로 700px 이상
- 파일명 자유 (`shot_001.png` OK)

스크린샷을 `scripts/prospect-finder/inputs/`에 드롭.

#### (b) 추출 실행

```sh
cd /Users/jisang.park/workspace/personal-projects/jeju-snap-finder
npm run prospect:extract -- --hashtag="#제주스냅"
```

옵션:
- `--hashtag="#..."` — 이번 배치 출처 태깅 (생략 가능)
- `--dry-run` — 추출만 하고 파일 저장 안 함 (테스트용)
- `--keep` — 처리 후 `processed/`로 이동 X, `inputs/`에 유지

결과: `outputs/extracted_YYYY-MM-DD.jsonl` 에 한 줄씩 누적.

#### (c) 개인노트북으로 전송

```sh
git add scripts/prospect-finder/outputs/
git commit -m "extract: 제주스냅 batch N"
git format-patch origin/main..HEAD -o ~/Desktop
# .patch 파일을 카톡 '나에게' 또는 메일로 전송
```

### 개인노트북: 적재

```sh
cd ~/jeju-snap-finder
git pull origin main
git am ~/Downloads/0001-*.patch

npm run prospect:sync
git push origin main
```

옵션:
- `--dry-run` — Supabase 적재 안 하고 콘솔 출력만
- `--keep` — 처리 후 `outputs/synced/`로 이동 X

성공한 jsonl은 `outputs/synced/`로 옮겨지고 (gitignore됨), 실패한 레코드가 1건이라도 있으면 파일 그대로 둠 → 다음 실행에서 재시도. Supabase upsert는 `ig_username` unique 기반이라 중복 안 됨.

### 개인노트북: 네이버 등록 여부 체크

Supabase Studio에서 `prospects` 테이블 열고:
- `naver_booking_search_url` 클릭 → 네이버 예약 검색
- `naver_smartstore_search_url` 클릭 → 스마트스토어 검색

확인 후 `naver_status` 갱신:
- `not_registered` — 영입 1순위
- `booking_only` / `smartstore_only` — 영입 2순위
- `both` — 영입 우선순위 낮음

### 개인노트북: 컨택 진행

`contact_status`를 `new → contacted → replied → onboarded`로 갱신.
영입 완료된 작가는 별도로 `packages` 테이블에 정식 등록.

---

## 비용 가이드

Claude vision (claude-opus-4-7) 기준 스크린샷 1장당 약 **$0.005~0.01**.
100장 처리 시 약 $0.5~1 = 700원~1,400원.

Sonnet으로 떨어뜨리려면 `extract.mjs`의 `MODEL` 상수만 `claude-sonnet-4-6`으로.

---

## 디렉터리 구조

```
scripts/prospect-finder/
├── README.md          # 이 문서
├── extract.mjs        # 회사컴: 스크린샷 → JSONL
├── sync.mjs           # 개인노트북: JSONL → Supabase
├── inputs/            # 스크린샷 드롭 (gitignore)
├── processed/         # 추출 완료 스크린샷 (gitignore)
└── outputs/           # JSONL (git 커밋 O — patch 전송용)
    └── synced/        # 적재 완료 아카이브 (gitignore)
```

---

## 트러블슈팅

- **`@anthropic-ai/sdk` 모듈 못 찾음** → `npm install` 다시 실행.
- **JSON 파싱 실패** → Claude가 비표준 응답 보낸 경우. 보통 재실행하면 해결. 반복되면 스크린샷 품질 문제.
- **sync 실패 후 재시도** → 같은 `outputs/*.jsonl` 다시 sync하면 됨 (upsert라 안전). 부분 실패 시 파일은 outputs/에 그대로 남음.
- **회사컴 git push 차단** → CLAUDE.md의 format-patch 흐름대로 개인노트북에서 push.
- **스크린샷이 모호** → 가로로 더 넓게, 프로필 헤더 풀샷으로 다시 찍기.

---

## 향후 확장

- [ ] 어드민 페이지(`/admin-prospects`)에서 후보 리스트 + 컨택 상태 토글 관리
- [ ] 네이버 검색 자동화 (Playwright 헤드리스로 등록 여부 자동 판정)
- [ ] 영입 완료 시 prospects → packages 승격 버튼
