import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Search, Heart, Users, HeartHandshake, Baby, Smile } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";

const Packages = () => {
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

  // Fetch packages from Supabase
  const { data: allPackages = [], isLoading } = useQuery({
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
  });

  // Filter and sort packages based on filters
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
      // If no occasion is selected, maintain original order
      if (selectedOccasion === "") return 0;
      
      // Get the index of selected occasion in each package's occasions array
      const aIndex = (a.occasions as string[]).indexOf(selectedOccasion);
      const bIndex = (b.occasions as string[]).indexOf(selectedOccasion);
      
      // Packages with the occasion as first element (index 0) should come first
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
          <h1 className="text-3xl font-bold mb-4">제주 인기스냅들을 한눈에!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            이제 인스타, 네이버에서 하나씩 힘들게 찾지 마세요. 제가 대신 한눈에 모아드렸어요 💙
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Buttons */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">촬영 목적 선택</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {occasionCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedOccasion === category.key;
            return (
              <button
                key={category.key}
                onClick={() => selectOccasion(category.key)}
                className={`flex-shrink-0 flex flex-col items-center p-4 rounded-2xl border-2 transition-all min-w-[100px] ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className={`p-3 rounded-full mb-2 ${
                  isSelected ? "bg-primary/20" : "bg-muted"
                }`}>
                  <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div className="max-w-md">
        <label className="text-sm font-medium mb-2 block">가격대</label>
        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="모든 가격" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 가격</SelectItem>
            <SelectItem value="under-100">10만원 미만</SelectItem>
            <SelectItem value="100-150">10만원 ~ 15만원</SelectItem>
            <SelectItem value="160-200">16만원 ~ 20만원</SelectItem>
            <SelectItem value="over-200">20만원 이상</SelectItem>
          </SelectContent>
        </Select>
      </div>

          {/* Active Filters & Clear */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              {(selectedOccasion !== "" || priceFilter !== "all") && (
                <>
                  <span className="text-sm text-muted-foreground">적용된 필터:</span>
                  {selectedOccasion && (
                    <Badge variant="secondary">
                      {selectedOccasion}
                    </Badge>
                  )}
                  {priceFilter !== "all" && (
                    <Badge variant="secondary">
                      {priceFilter}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    모두 지우기
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredPackages.length}개 패키지 발견
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">패키지가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                필터를 조정해서 더 많은 패키지를 찾아보세요.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                모든 필터 지우기
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Packages;