import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Search, Heart, Users, Camera, User, Baby } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl } from "@/lib/utils";

const Packages = () => {
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState("all");

  // Define occasion categories with icons based on actual database values
  const occasionCategories = [
    { key: "커플", label: "커플", icon: Heart },
    { key: "가족", label: "가족", icon: Users },
    { key: "우정", label: "우정", icon: Camera },
    { key: "만삭", label: "만삭", icon: Baby },
    { key: "개인", label: "개인", icon: User },
    { key: "아기", label: "아기", icon: Baby },
  ];

  const toggleOccasion = (occasionKey: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasionKey)
        ? prev.filter(occ => occ !== occasionKey)
        : [...prev, occasionKey]
    );
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
        duration: pkg.duration_minutes ? `${pkg.duration_minutes} minutes` : "Duration TBD",
        occasions: pkg.occasions || ["Photography"],
        images: [formatThumbnailUrl(pkg.thumbnail_url)],
        featured: false,
      }));
    },
  });

  // Filter packages based on filters
  const filteredPackages = allPackages.filter((pkg) => {
    const matchesOccasion = selectedOccasions.length === 0 || pkg.occasions.some(occ => selectedOccasions.includes(occ));
    
    let matchesPrice = true;
    if (priceFilter === "under-150") matchesPrice = pkg.price < 150000;
    else if (priceFilter === "150-300") matchesPrice = pkg.price >= 150000 && pkg.price <= 300000;
    else if (priceFilter === "300-500") matchesPrice = pkg.price >= 300000 && pkg.price <= 500000;
    else if (priceFilter === "over-500") matchesPrice = pkg.price > 500000;

    return matchesOccasion && matchesPrice;
  });

  const clearFilters = () => {
    setSelectedOccasions([]);
    setPriceFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-12 pb-12 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Photography Packages</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect photography experience for your special moments in Jeju Island
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Buttons */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Choose Your Occasion</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {occasionCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedOccasions.includes(category.key);
            return (
              <button
                key={category.key}
                onClick={() => toggleOccasion(category.key)}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
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
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All prices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All prices</SelectItem>
            <SelectItem value="under-150">Under ₩150,000</SelectItem>
            <SelectItem value="150-300">₩150,000 - ₩300,000</SelectItem>
            <SelectItem value="300-500">₩300,000 - ₩500,000</SelectItem>
            <SelectItem value="over-500">Over ₩500,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

          {/* Active Filters & Clear */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              {(selectedOccasions.length > 0 || priceFilter !== "all") && (
                <>
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedOccasions.map(occasion => {
                    const category = occasionCategories.find(cat => cat.key === occasion);
                    return (
                      <Badge key={occasion} variant="secondary">
                        {category?.label || occasion}
                      </Badge>
                    );
                  })}
                  {priceFilter !== "all" && (
                    <Badge variant="secondary">
                      {priceFilter}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} found
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
              <h3 className="text-lg font-medium mb-2">No packages found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to find more packages.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
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