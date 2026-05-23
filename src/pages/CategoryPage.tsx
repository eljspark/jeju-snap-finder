import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Filter, Camera, MapPin, Clock, Heart, Users, HeartHandshake, Baby, Smile } from "lucide-react";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";

type OccasionKey = "커플" | "가족" | "우정" | "만삭" | "아기";

interface CategoryCopy {
  h1: string;
  subhead: string;
  guideTitle: string;
  guideItems: { title: string; body: string }[];
}

const CATEGORY_COPY: Record<OccasionKey, CategoryCopy> = {
  "가족": {
    h1: "제주 가족스냅 추천 - 가격·작가·스타일 비교",
    subhead: "제주도 가족스냅 작가들을 한 곳에서 가격·촬영 시간·스타일별로 비교해보세요. 부모·아이·3대 가족까지 인원 구성에 맞는 패키지를 추천합니다.",
    guideTitle: "제주 가족스냅 선택 가이드",
    guideItems: [
      {
        title: "1. 인원 구성에 맞는 작가",
        body: "부모와 아이 2~4명 단위 촬영에 익숙한 작가, 3대 가족(조부모 포함) 다인원 촬영 경험이 있는 작가가 다릅니다. 패키지 설명의 '추가 인원 비용'과 작가 포트폴리오를 함께 확인하세요."
      },
      {
        title: "2. 추천 시간대",
        body: "오전 9~11시 또는 오후 4~6시(여름 기준 5~7시)가 자연광이 부드럽고 아이 컨디션이 좋은 시간대입니다. 30분~1시간 패키지는 이동 시간을 고려해 한 장소에 집중하는 게 효율적이에요."
      },
      {
        title: "3. 추천 촬영지",
        body: "협재·함덕 해수욕장은 모래사장에서 아이의 자연스러운 모습을 담기 좋고, 카페·돌담길은 흐린 날에도 분위기가 살아납니다. 작가에게 가족 구성·아이 나이를 미리 공유하면 맞춤 장소를 추천받을 수 있습니다."
      },
      {
        title: "4. 가격대",
        body: "10만원대(30분, 원본 50~100장)부터 20만원대(1시간 이상, 보정컷 다수)까지 다양합니다. 보정컷 수와 원본 제공 여부를 가격과 함께 비교하세요."
      }
    ]
  },
  "커플": {
    h1: "제주 커플스냅 추천 - 가격·작가·스타일 비교",
    subhead: "제주 여행을 추억으로 남길 커플스냅 작가를 한 곳에서 비교하세요. 데이트·기념일·프로포즈 등 컨셉별로 어울리는 패키지를 추천합니다.",
    guideTitle: "제주 커플스냅 선택 가이드",
    guideItems: [
      {
        title: "1. 컨셉 정하기",
        body: "데일리 데이트 컨셉, 화이트 드레스/정장 컨셉, 한복 컨셉 등 컨셉에 따라 어울리는 작가가 다릅니다. 작가 포트폴리오에서 비슷한 톤의 사진이 많은지 확인하세요."
      },
      {
        title: "2. 추천 시간대",
        body: "일출(여름 5시대, 겨울 7시대) 또는 일몰 1시간 전 골든아워가 가장 인기 많습니다. 평일이면 한적한 촬영지를 단독으로 쓸 수 있어 추천."
      },
      {
        title: "3. 추천 촬영지",
        body: "협재해수욕장(흰 모래·에메랄드빛 바다), 새별오름(억새), 비자림(숲), 우도(개방감) — 컨셉에 맞는 배경을 선택하세요. 이동 시간이 길면 1시간 패키지가 부족할 수 있습니다."
      },
      {
        title: "4. 가격대",
        body: "30분 8~12만원, 1시간 15~25만원이 일반적입니다. 보정컷 수와 원본 제공 여부, 촬영지 이동 비용 포함 여부를 비교하세요."
      }
    ]
  },
  "우정": {
    h1: "제주 우정스냅 추천 - 친구와 함께하는 여행 스냅 비교",
    subhead: "친구와 함께한 제주 여행을 추억으로 남길 우정스냅 작가를 비교하세요. 2~6명 인원 구성과 분위기에 어울리는 패키지를 추천합니다.",
    guideTitle: "제주 우정스냅 선택 가이드",
    guideItems: [
      {
        title: "1. 인원수에 맞는 작가",
        body: "2인 친구 촬영과 4~6인 단체 촬영은 구도·렌즈·소요 시간이 다릅니다. 인원이 많을수록 1시간 이상 패키지가 안정적이에요."
      },
      {
        title: "2. 의상/소품",
        body: "비슷한 톤의 의상이나 매칭 소품(같은 색 모자, 같은 색 옷)이 있으면 사진 통일감이 살아납니다. 작가에게 미리 공유하면 동선 추천도 받을 수 있어요."
      },
      {
        title: "3. 추천 촬영지",
        body: "감귤밭, 카페거리, 함덕해변 등 활동적인 분위기가 잘 살아나는 곳이 인기. 단체 점프샷·달리는 컷은 모래사장이 적합합니다."
      },
      {
        title: "4. 가격대",
        body: "인원이 추가될수록 추가 비용이 붙는 경우가 많으니, 패키지의 기본 인원과 인당 추가 비용을 함께 확인하세요."
      }
    ]
  },
  "만삭": {
    h1: "제주 만삭스냅 추천 - 가격·작가·스타일 비교",
    subhead: "제주에서 임신 기념 만삭스냅을 남길 작가들을 한 곳에서 비교하세요. 자연 배경과 스튜디오 컨셉을 모두 다루는 작가들을 큐레이션했습니다.",
    guideTitle: "제주 만삭스냅 선택 가이드",
    guideItems: [
      {
        title: "1. 추천 시기",
        body: "임신 32~36주가 일반적인 만삭 촬영 시기입니다. 산모 컨디션을 고려해 1시간 이내 짧은 촬영, 가까운 한 장소 집중이 안전합니다."
      },
      {
        title: "2. 의상과 소품",
        body: "흰 드레스·맨발 컨셉이 자연 배경에 가장 잘 어울립니다. 작가가 드레스를 제공하는지, 본인 의상을 가져가야 하는지 확인하세요."
      },
      {
        title: "3. 추천 촬영지",
        body: "협재·함덕 해수욕장(자연광 + 백사장)이 가장 인기. 흐린 날·바람이 강한 날엔 카페나 실내 스튜디오 옵션이 있는 작가를 선택하세요."
      },
      {
        title: "4. 가격대",
        body: "10만원대(30분~1시간)부터 20만원대(드레스 포함, 보정컷 다수)까지. 산모 안전을 위해 작가와 미리 일정·동선을 자세히 협의하는 것이 중요합니다."
      }
    ]
  },
  "아기": {
    h1: "제주 아기스냅·돌스냅 추천 - 가격·작가 비교",
    subhead: "제주에서 아기·돌 기념 스냅을 남길 작가를 한 곳에서 비교하세요. 아기 컨디션과 동선을 고려한 패키지를 추천합니다.",
    guideTitle: "제주 아기스냅 선택 가이드",
    guideItems: [
      {
        title: "1. 아기 컨디션 우선",
        body: "촬영 시간은 아기의 낮잠 시간을 피하고, 한 번에 30분~1시간 이내가 적합합니다. 작가에게 아기 월령을 미리 알리세요."
      },
      {
        title: "2. 추천 시간대",
        body: "오전 9~10시 또는 오후 4~5시. 한낮은 햇빛이 강해 아기 눈에 부담이 갈 수 있습니다."
      },
      {
        title: "3. 추천 촬영지",
        body: "그늘이 있는 카페, 차량 이동이 짧은 해변, 키즈 친화 공간 등 아기·기저귀 가방·이동 동선까지 고려한 곳을 추천."
      },
      {
        title: "4. 가격대",
        body: "10~20만원대가 일반적입니다. 보정컷 수·원본 제공 여부·아기 의상 대여 포함 여부를 비교하세요."
      }
    ]
  }
};

const OCCASION_CATEGORIES: { key: OccasionKey; label: string; icon: typeof Heart; slug: string }[] = [
  { key: "커플", label: "커플", icon: Heart, slug: "couple" },
  { key: "가족", label: "가족", icon: Users, slug: "family" },
  { key: "우정", label: "우정", icon: HeartHandshake, slug: "friends" },
  { key: "만삭", label: "만삭", icon: Smile, slug: "maternity" },
  { key: "아기", label: "아기", icon: Baby, slug: "baby" },
];

const PRICE_FILTERS = [
  { key: "all", label: "모든 가격" },
  { key: "under-100", label: "10만원 미만" },
  { key: "100-150", label: "10만원 ~ 15만원" },
  { key: "160-200", label: "16만원 ~ 20만원" },
  { key: "over-200", label: "20만원 이상" },
];

interface CategoryPageProps {
  occasion: OccasionKey;
  packages?: any[];
}

const CategoryPage = ({ occasion, packages: staticPackages }: CategoryPageProps) => {
  const [priceFilter, setPriceFilter] = useState("all");

  const copy = CATEGORY_COPY[occasion];

  const normalized = (staticPackages || []).map((pkg: any) => ({
    id: pkg.id,
    title: pkg.title,
    price: pkg.price_krw ?? pkg.price ?? 0,
    duration: pkg.duration_minutes ? formatDuration(pkg.duration_minutes) : (pkg.duration || "촬영 시간 미정"),
    occasions: pkg.occasions || [],
    images: [formatThumbnailUrl(pkg.thumbnail_url || pkg.images?.[0])],
    featured: pkg.featured || false,
  }));

  const filtered = normalized.filter((pkg) => {
    if (priceFilter === "under-100") return pkg.price < 100000;
    if (priceFilter === "100-150") return pkg.price >= 100000 && pkg.price <= 150000;
    if (priceFilter === "160-200") return pkg.price >= 160000 && pkg.price <= 200000;
    if (priceFilter === "over-200") return pkg.price > 200000;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-12 pb-12 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{copy.h1}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
            {copy.subhead}
          </p>
        </div>
      </section>

      {/* Category Filter — persists on category pages; active one is highlighted and clears filter on re-click */}
      <section className="pt-8 pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-1">
            <h2 className="text-lg font-medium mb-4">촬영 목적 선택</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {OCCASION_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = category.key === occasion;
                const href = isActive ? "/" : `/category/${category.slug}`;
                return (
                  <a
                    key={category.key}
                    href={href}
                    className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-[80px] ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-1 ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>
                      {category.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Price Filter */}
      <section className="pt-2 pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <DropdownMenu>
              <div className="flex items-center gap-2">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 p-2">
                    <Filter className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium">가격대</span>
                  </Button>
                </DropdownMenuTrigger>
                {priceFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {PRICE_FILTERS.find((f) => f.key === priceFilter)?.label}
                  </Badge>
                )}
              </div>
              <DropdownMenuContent align="end" className="w-48">
                {PRICE_FILTERS.map((f) => (
                  <DropdownMenuItem
                    key={f.key}
                    onClick={() => setPriceFilter(f.key)}
                    className={priceFilter === f.key ? "bg-primary/10 text-primary" : ""}
                  >
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">선택한 필터에 맞는 패키지가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Guide */}
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
                  제주도의 아름다운 풍경을 배경으로 전문 사진작가가 진행하는 스냅 촬영. 작가별 스타일·가격을 한 곳에서 비교하세요.
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
                  협재·함덕 해수욕장, 새별오름, 비자림, 카페거리 등 제주의 다양한 촬영지에서 진행. 작가에게 컨셉·일정을 공유하면 맞춤 동선을 추천받을 수 있어요.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <CardTitle>유연한 시간 옵션</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  30분 미니 패키지부터 2시간 풀 패키지까지. 일정과 예산에 맞춰 가격대별 필터로 빠르게 비교하세요.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12 p-8 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{copy.guideTitle}</h2>
            <div className="space-y-4 text-muted-foreground">
              {copy.guideItems.map((item) => (
                <div key={item.title}>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-category links for internal SEO */}
          <nav aria-label="다른 카테고리" className="flex flex-wrap gap-2 justify-center text-sm">
            <span className="text-muted-foreground mr-2">다른 카테고리:</span>
            {(Object.keys(CATEGORY_COPY) as OccasionKey[])
              .filter((k) => k !== occasion)
              .map((k) => (
                <a
                  key={k}
                  href={`/category/${OCCASION_KO_TO_EN[k]}`}
                  className="text-primary hover:underline"
                >
                  제주 {k}스냅
                </a>
              ))}
          </nav>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const OCCASION_KO_TO_EN: Record<OccasionKey, string> = {
  "커플": "couple",
  "가족": "family",
  "우정": "friends",
  "만삭": "maternity",
  "아기": "baby",
};

export default CategoryPage;
export { OCCASION_KO_TO_EN, CATEGORY_COPY };
export type { OccasionKey };
