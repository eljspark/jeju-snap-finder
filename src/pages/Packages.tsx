import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Search, Heart, Users, HeartHandshake, Baby, Smile, Filter, Camera, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";

const Packages = ({ packages: staticPackages }: { packages?: any[] }) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState("all");

  // Define occasion categories with icons based on actual database values
  const occasionCategories = [
    { key: "커플", label: "커플", icon: Heart },
    { key: "가족", label: "가족", icon: Users },
    { key: "우정", label: "우정", icon: HeartHandshake },
    { key: "만삭", label: "만삭", icon: Smile },
    { key: "아기", label: "아기", icon: Baby },
  ];

  const selectOccasion = (occasionKey: string) => {
    setSelectedOccasion(prev => prev === occasionKey ? "" : occasionKey);
  };

  // Fetch packages from Supabase with static data fallback
  const { data: queryPackages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*');
      
      if (error) throw error;
      
      return data.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
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

  const filteredPackages = allPackages
    .filter((pkg) => {
      const matchesOccasion = selectedOccasion === "" || (pkg.occasions as string[]).includes(selectedOccasion);
      
      let matchesPrice = true;
      if (priceFilter === "under-100") matchesPrice = pkg.price < 100000;
      else if (priceFilter === "100-150") matchesPrice = pkg.price >= 100000 && pkg.price <= 150000;
      else if (priceFilter === "160-200") matchesPrice = pkg.price >= 160000 && pkg.price <= 200000;
      else if (priceFilter === "over-200") matchesPrice = pkg.price > 200000;

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
    setPriceFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-12 pb-12 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">제주 스냅 촬영 비교 - 커플, 가족, 만삭 스냅 패키지 총정리</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            인스타, 네이버에는 웨딩스냅만 많아서<br />
            커플스냅, 가족스냅을 찾기 힘들었다면?<br /><br />
            제가 대신 한곳에 모아드렸어요! 💙
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pt-8 pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-1">
            <h2 className="text-lg font-medium mb-4">촬영 목적 선택</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {occasionCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedOccasion === category.key;
                return (
                  <button
                    key={category.key}
                    onClick={() => selectOccasion(category.key)}
                    className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-[80px] ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-1 ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-xs font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedOccasion !== "" || priceFilter !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">적용된 필터:</span>
              {selectedOccasion && (
                <Badge variant="secondary">
                  {selectedOccasion}
                </Badge>
              )}
              {priceFilter !== "all" && (
                <Badge variant="secondary">
                  {priceFilter === "under-100" && "10만원 미만"}
                  {priceFilter === "100-150" && "10만원 ~ 15만원"}
                  {priceFilter === "160-200" && "16만원 ~ 20만원"}
                  {priceFilter === "over-200" && "20만원 이상"}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                모두 지우기
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-end">
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
                    {priceFilter === "under-100" && "10만원 미만"}
                    {priceFilter === "100-150" && "10만원 ~ 15만원"}
                    {priceFilter === "160-200" && "16만원 ~ 20만원"}
                    {priceFilter === "over-200" && "20만원 이상"}
                  </Badge>
                )}
              </div>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setPriceFilter("all")}
                  className={priceFilter === "all" ? "bg-primary/10 text-primary" : ""}
                >
                  모든 가격
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriceFilter("under-100")}
                  className={priceFilter === "under-100" ? "bg-primary/10 text-primary" : ""}
                >
                  10만원 미만
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriceFilter("100-150")}
                  className={priceFilter === "100-150" ? "bg-primary/10 text-primary" : ""}
                >
                  10만원 ~ 15만원
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriceFilter("160-200")}
                  className={priceFilter === "160-200" ? "bg-primary/10 text-primary" : ""}
                >
                  16만원 ~ 20만원
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriceFilter("over-200")}
                  className={priceFilter === "over-200" ? "bg-primary/10 text-primary" : ""}
                >
                  20만원 이상
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
