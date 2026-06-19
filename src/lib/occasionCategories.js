export const PUBLIC_OCCASION_CATEGORIES = [
  { key: "가족", label: "가족", slug: "family", icon: "Users", imageClass: "from-sky-100 to-blue-200 text-blue-500" },
  { key: "웨딩", label: "웨딩", slug: "wedding", icon: "Gem", imageClass: "from-stone-100 to-rose-200 text-stone-600" },
  { key: "커플", label: "커플", slug: "couple", icon: "Heart", imageClass: "from-rose-100 to-pink-200 text-rose-500" },
  { key: "만삭", label: "만삭", slug: "maternity", icon: "Smile", imageClass: "from-violet-100 to-purple-200 text-purple-500" },
  { key: "아기", label: "아기", slug: "baby", icon: "Baby", imageClass: "from-emerald-100 to-teal-200 text-teal-500" },
];

const ROUTABLE_OCCASION_CATEGORIES = [
  ...PUBLIC_OCCASION_CATEGORIES,
  { key: "우정", label: "우정", slug: "friends", icon: "HeartHandshake", imageClass: "from-amber-100 to-orange-200 text-orange-500" },
];

export const MIN_VISIBLE_PACKAGES_BY_OCCASION = {
  "웨딩": 3,
  "우정": 1,
};

export const OCCASION_EN_TO_KO = Object.fromEntries(
  ROUTABLE_OCCASION_CATEGORIES.map((category) => [category.slug, category.key]),
);

export function countPackagesForOccasion(packages = [], occasionKey) {
  return packages.filter((pkg) => Array.isArray(pkg.occasions) && pkg.occasions.includes(occasionKey)).length;
}

export function isOccasionVisible(packages = [], occasionKey) {
  const minPackageCount = MIN_VISIBLE_PACKAGES_BY_OCCASION[occasionKey] || 0;
  return minPackageCount === 0 || countPackagesForOccasion(packages, occasionKey) >= minPackageCount;
}

export function getVisibleOccasionCategories(packages = []) {
  return PUBLIC_OCCASION_CATEGORIES.filter((category) => isOccasionVisible(packages, category.key));
}

export function getVisibleOccasionSlugs(packages = []) {
  return ROUTABLE_OCCASION_CATEGORIES
    .filter((category) => isOccasionVisible(packages, category.key))
    .map((category) => category.slug);
}
