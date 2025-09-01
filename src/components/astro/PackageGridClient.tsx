import { useState } from 'react';
import type { PackageData } from '@/lib/astro-supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Camera, Heart, Users, User, Baby, ChevronDown, X } from 'lucide-react';

interface Props {
  packages: PackageData[];
}

const occasionCategories = [
  { id: "커플", label: "커플", icon: Heart },
  { id: "가족", label: "가족", icon: Users },
  { id: "개인", label: "개인", icon: User },
  { id: "아기", label: "아기", icon: Baby },
  { id: "기타", label: "기타", icon: Camera }
];

const priceRanges = [
  { id: "all", label: "전체 가격", min: 0, max: Infinity },
  { id: "under-100", label: "10만원 이하", min: 0, max: 100000 },
  { id: "100-200", label: "10-20만원", min: 100000, max: 200000 },
  { id: "200-300", label: "20-30만원", min: 200000, max: 300000 },
  { id: "over-300", label: "30만원 이상", min: 300000, max: Infinity }
];

export default function PackageGridClient({ packages }: Props) {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  const selectedPriceRange = priceRanges.find(range => range.id === priceFilter) || priceRanges[0];
  
  const filteredPackages = packages.filter(pkg => {
    const matchesOccasion = !selectedOccasion || pkg.occasions.includes(selectedOccasion);
    const matchesPrice = pkg.price >= selectedPriceRange.min && pkg.price <= selectedPriceRange.max;
    return matchesOccasion && matchesPrice;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (selectedOccasion) {
      const aHasOccasion = a.occasions.includes(selectedOccasion);
      const bHasOccasion = b.occasions.includes(selectedOccasion);
      if (aHasOccasion && !bHasOccasion) return -1;
      if (!aHasOccasion && bHasOccasion) return 1;
    }
    return 0;
  });

  const clearFilters = () => {
    setSelectedOccasion("");
    setPriceFilter("all");
  };

  return (
    <>
      {/* Filter Section */}
      <div className="mb-8 space-y-4">
        {/* Occasion Categories */}
        <div className="flex flex-wrap gap-3 justify-center">
          {occasionCategories.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={selectedOccasion === id ? "default" : "outline"}
              className="flex items-center gap-2 transition-all duration-200"
              onClick={() => setSelectedOccasion(selectedOccasion === id ? "" : id)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Price Filter */}
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>{selectedPriceRange.label}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {priceRanges.map(range => (
                <DropdownMenuItem 
                  key={range.id}
                  onClick={() => setPriceFilter(range.id)}
                  className={priceFilter === range.id ? "bg-accent" : ""}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results */}
      {sortedPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPackages.map((pkg) => (
            <a 
              key={pkg.id} 
              href={`/packages/${pkg.id}`}
              className="group block"
            >
              <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 group-hover:-translate-y-1">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={pkg.thumbnailUrl} 
                    alt={`${pkg.title} 촬영 샘플`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    ₩{pkg.price.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm mb-3">
                    촬영 시간: {pkg.duration}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.occasions.map((occasion) => (
                      <Badge key={occasion} variant="secondary" className="text-xs">
                        {occasion}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            조건에 맞는 패키지가 없습니다
          </h3>
          <p className="text-muted-foreground mb-4">
            다른 조건으로 검색해보시거나 필터를 초기화해보세요.
          </p>
          <Button 
            onClick={clearFilters} 
            variant="outline" 
            className="flex items-center gap-2 mx-auto"
          >
            <X className="w-4 h-4" />
            필터 초기화
          </Button>
        </div>
      )}
    </>
  );
}