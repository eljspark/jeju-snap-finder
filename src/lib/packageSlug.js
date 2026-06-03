const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TITLE_SLUG_OVERRIDES = {
  "오우리스냅": "ohwoorisnap",
  "브라이트데이": "brightday",
  "제주스냅 의미": "jejusnap-uimi",
  "두유필름 스튜디오": "doyoufilm-studio",
  "레드스냅": "redsnap",
  "오르다스냅": "oreudasnap",
  "다즐스냅": "dazzlesnap",
  "플로피스냅": "floppysnap",
  "젠타일스스튜디오": "zentilesstudio",
  "소우주스냅": "sowoojoosnap",
  "제주로그": "jejulog",
  "동완필름": "dongwanfilm",
  "스냅구도": "snapgudo",
  "니우스튜디오": "niustudio",
  "아워페이지 제주": "ourpage-jeju",
  "소희스냅": "soheesnap",
  "제주 애월곳간": "jeju-aewolgotgan",
  "올레감사제주스냅": "ollegamsa-jejusnap",
  "제이림스냅": "jaylimsnap",
  "초월스냅": "chowolsnap",
  "러브그래퍼": "lovegrapher",
  "송그림일기스냅": "songgeurim-ilgisnap",
  "여리스냅": "yeorisnap",
  "오랜지팝스튜디오": "orangepop-studio",
  "온리그래퍼": "onlygrapher",
  "택하다제주": "taekhada-jeju",
  "누보스튜디오": "nuvostudio",
  "차노다스냅": "chanodasnap",
  "스튜디오 오라리": "studio-orari",
  "다미사진관": "photodami",
  "담포토그라피": "damphotography",
  "사소한날": "sasohan-nal",
};

function normalizeTitle(value) {
  return String(value || "").normalize("NFC").trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function folderPathSlug(folderPath) {
  const lastSegment = String(folderPath || "")
    .split("/")
    .filter(Boolean)
    .pop();

  const slug = slugify(lastSegment || "");
  if (!slug || UUID_RE.test(slug)) return "";
  return slug;
}

export function getPackageSlug(pkg) {
  if (!pkg) return "";
  if (pkg.package_slug) return pkg.package_slug;
  if (pkg.slug) return pkg.slug;

  const title = normalizeTitle(pkg.title);
  if (TITLE_SLUG_OVERRIDES[title]) return TITLE_SLUG_OVERRIDES[title];

  return folderPathSlug(pkg.folder_path) || slugify(title) || pkg.id;
}

export function buildPackageSlugs(packages) {
  const seen = new Map();

  return (packages || []).map((pkg) => {
    const baseSlug = getPackageSlug(pkg);
    const count = (seen.get(baseSlug) || 0) + 1;
    seen.set(baseSlug, count);

    return {
      ...pkg,
      package_slug: count === 1 ? baseSlug : `${baseSlug}-${count}`,
    };
  });
}

export function findPackageBySlugOrId(packages, slugOrId) {
  const value = String(slugOrId || "");
  const packagesWithSlugs = buildPackageSlugs(packages || []);

  return packagesWithSlugs.find((pkg) => pkg.id === value || pkg.package_slug === value) || null;
}
