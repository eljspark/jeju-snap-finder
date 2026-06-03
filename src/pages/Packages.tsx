import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Heart, Users, HeartHandshake, Baby, Smile, Camera, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";
import { buildPackageSlugs } from "@/lib/packageSlug.js";

const PRICE_MIN_FALLBACK = 50000;
const PRICE_MAX_FALLBACK = 500000;
const PRICE_STEP = 10000;

const formatPriceLabel = (value: number) => `₩${value.toLocaleString()}`;

const Packages = ({ packages: staticPackages }: { packages?: any[] }) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN_FALLBACK, PRICE_MAX_FALLBACK]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);

  // Define occasion categories with icons based on actual database values
  const occasionCategories = [
    { key: "커플", label: "커플", icon: Heart, slug: "couple", imageClass: "from-rose-100 to-pink-200 text-rose-500" },
    { key: "가족", label: "가족", icon: Users, slug: "family", imageClass: "from-sky-100 to-blue-200 text-blue-500" },
    { key: "우정", label: "우정", icon: HeartHandshake, slug: "friends", imageClass: "from-amber-100 to-orange-200 text-orange-500" },
    { key: "만삭", label: "만삭", icon: Smile, slug: "maternity", imageClass: "from-violet-100 to-purple-200 text-purple-500" },
    { key: "아기", label: "아기", icon: Baby, slug: "baby", imageClass: "from-emerald-100 to-teal-200 text-teal-500" },
  ];

  const selectOccasion = (slug: string) => {
    // Navigate to the dedicated category page so URL reflects the filter
    // (improves SEO and lets users share/bookmark the filtered view)
    if (typeof window !== "undefined") {
      window.location.href = `/category/${slug}`;
    }
  };

  // Fetch packages from Supabase with static data fallback
  const { data: queryPackages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*');
      
      if (error) throw error;
      
      return buildPackageSlugs(data || []).map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        package_slug: pkg.package_slug,
        price: pkg.price_krw,
        duration: pkg.duration_minutes ? formatDuration(pkg.duration_minutes) : "촬영 시간 미정",
        occasions: pkg.occasions || ["Photography"],
        images: [formatThumbnailUrl(pkg.thumbnail_url)],
        featured: false,
      }));
    },
    initialData: staticPackages,
    staleTime: 0, // Always fetch fresh data for real-time updates
  });

  const allPackages = queryPackages?.length > 0 ? queryPackages : (staticPackages || []);
  const packagePrices = allPackages.map((pkg) => Number(pkg.price) || 0).filter((price) => price > 0);
  const minPackagePrice = packagePrices.length ? Math.min(...packagePrices) : PRICE_MIN_FALLBACK;
  const maxPackagePrice = allPackages.reduce((max, pkg) => Math.max(max, Number(pkg.price) || 0), 0);
  const priceMin = Math.max(0, Math.floor(minPackagePrice / PRICE_STEP) * PRICE_STEP);
  const priceMax = Math.max(PRICE_MAX_FALLBACK, Math.ceil(maxPackagePrice / 50000) * 50000);
  const activePriceRange: [number, number] = isPriceFilterActive ? priceRange : [priceMin, priceMax];
  const hasCustomPriceRange = isPriceFilterActive && (activePriceRange[0] !== priceMin || activePriceRange[1] !== priceMax);
  const priceSummary = hasCustomPriceRange
    ? `${formatPriceLabel(activePriceRange[0])} - ${formatPriceLabel(activePriceRange[1])}`
    : "전체 가격";

  const filteredPackages = allPackages
    .filter((pkg) => {
      const matchesOccasion = selectedOccasion === "" || (pkg.occasions as string[]).includes(selectedOccasion);
      const matchesPrice = pkg.price >= activePriceRange[0] && pkg.price <= activePriceRange[1];

      return matchesOccasion && matchesPrice;
    })
    .sort((a, b) => {
      if (selectedOccasion === "") return 0;
      const aIndex = (a.occasions as string[]).indexOf(selectedOccasion);
      const bIndex = (b.occasions as string[]).indexOf(selectedOccasion);
      return aIndex - bIndex;
    });

  const clearFilters = () => {
    setSelectedOccasion("");
    setPriceRange([priceMin, priceMax]);
    setIsPriceFilterActive(false);
  };

  const handlePriceRangeChange = (value: number[]) => {
    const nextRange: [number, number] = [value[0] ?? priceMin, value[1] ?? priceMax];
    setPriceRange(nextRange);
    setIsPriceFilterActive(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-12 pb-12 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">제주 스냅 촬영 비교 - 커플, 가족, 만삭 스냅 패키지 총정리</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            제주도 커플스냅, 가족스냅, 만삭스냅 작가님들을<br />가격별, 유형별로 쉽게 비교하고 찾을 수 있어요.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pt-8 pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <h2 className="text-lg font-medium mb-4">촬영 목적 선택</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {occasionCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <a
                    key={category.key}
                    href={`/category/${category.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      selectOccasion(category.slug);
                    }}
                    className="flex-shrink-0 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-soft transition-all hover:border-primary/50 hover:shadow-medium"
                  >
                    <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${category.imageClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">{category.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-background p-5 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                    ₩
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">가격필터</h2>
                    <p className="text-sm text-muted-foreground">원하는 예산 범위를 선택하세요</p>
                  </div>
                </div>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {priceSummary}
              </div>
            </div>

            <div className="px-1">
              <Slider
                min={priceMin}
                max={priceMax}
                step={PRICE_STEP}
                value={activePriceRange}
                onValueChange={handlePriceRangeChange}
                minStepsBetweenThumbs={1}
                aria-label="가격 범위"
              />
              <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{formatPriceLabel(priceMin)}</span>
                <span>{formatPriceLabel(priceMax)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{filteredPackages.length}개 패키지</p>
                <p className="text-xs text-muted-foreground">
                  {hasCustomPriceRange ? "가격필터 적용됨" : "전체 가격대 표시 중"}
                </p>
              </div>
              {hasCustomPriceRange && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  초기화
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">조건에 맞는 패키지</p>
              <h2 className="text-2xl font-bold">{filteredPackages.length}개 패키지</h2>
            </div>
            {hasCustomPriceRange && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                필터 초기화
              </Button>
            )}
          </div>

          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                선택한 필터에 맞는 패키지가 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Informative Content Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Camera className="h-8 w-8 text-primary" />
                  <CardTitle>전문 스냅 촬영</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  제주도의 아름다운 풍경을 배경으로 전문 사진작가가 촬영하는 
                  스냅 촬영 서비스입니다. 커플, 가족, 우정, 만삭, 아기 등 
                  다양한 테마의 촬영을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-primary" />
                  <CardTitle>제주 명소 촬영지</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  협재해수욕장, 성산일출봉, 우도 등 제주도의 유명 관광지에서 
                  촬영이 진행됩니다. 각 촬영지의 특성에 맞는 최적의 
                  시간대를 선택하여 아름다운 사진을 남겨드립니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-primary" />
                  <CardTitle>고품질 결과물</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  전문 장비로 촬영하고 세심한 보정 작업을 거쳐 
                  고해상도 사진을 제공합니다. 온라인 갤러리를 통해 
                  편리하게 다운로드하실 수 있으며, 인화용 파일도 포함됩니다.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How to Choose Section */}
          <div className="mb-12 p-8 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">스냅 촬영 패키지 선택 가이드</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. 촬영 목적 결정</h3>
                <p>
                  커플 여행 기념, 가족 여행 추억, 만삭 기념 등 촬영의 주요 목적을 
                  먼저 정하세요. 각 패키지는 특정 테마에 최적화되어 있습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2. 예산 및 시간 확인</h3>
                <p>
                  촬영 소요 시간과 예산을 고려하여 적합한 패키지를 선택하세요. 
                  가격대별 필터를 활용하면 예산에 맞는 패키지를 쉽게 찾을 수 있습니다.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3. 촬영지 및 시간대 고려</h3>
                <p>
                  해변 촬영은 일출이나 일몰 시간대가 가장 아름답고, 
                  관광지 촬영은 평일 오전이 한적합니다. 원하시는 분위기와 
                  일정에 맞는 패키지를 선택하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Packages;
