import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Search, Filter, MapPin, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

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
        duration: "2 hours", // Default since not in DB
        occasion: pkg.occasions[0] || "Photography",
        images: pkg.sample_image_urls || [pkg.thumbnail_url || "/placeholder.svg"],
        featured: false,
      }));
    },
  });

  // Filter packages based on search and filters
  const filteredPackages = allPackages.filter((pkg) => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOccasion = occasionFilter === "all" || pkg.occasion.toLowerCase() === occasionFilter;
    const matchesLocation = locationFilter === "all"; // Location filter disabled since not in DB
    
    let matchesPrice = true;
    if (priceFilter === "under-150") matchesPrice = pkg.price < 150000;
    else if (priceFilter === "150-300") matchesPrice = pkg.price >= 150000 && pkg.price <= 300000;
    else if (priceFilter === "300-500") matchesPrice = pkg.price >= 300000 && pkg.price <= 500000;
    else if (priceFilter === "over-500") matchesPrice = pkg.price > 500000;

    return matchesSearch && matchesOccasion && matchesLocation && matchesPrice;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setOccasionFilter("all");
    setLocationFilter("all");
    setPriceFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-card">
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages, photographers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Occasion Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Occasion</label>
              <Select value={occasionFilter} onValueChange={setOccasionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All occasions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All occasions</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="hyeopjae">Hyeopjae Beach</SelectItem>
                  <SelectItem value="seongsan">Seongsan Ilchulbong</SelectItem>
                  <SelectItem value="woljeongri">Woljeongri Beach</SelectItem>
                  <SelectItem value="jeju city">Jeju City</SelectItem>
                  <SelectItem value="spirited">Spirited Garden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            <div>
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
          </div>

          {/* Active Filters & Clear */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              {(occasionFilter !== "all" || locationFilter !== "all" || priceFilter !== "all" || searchTerm) && (
                <>
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {occasionFilter !== "all" && (
                    <Badge variant="secondary">
                      {occasionFilter.charAt(0).toUpperCase() + occasionFilter.slice(1)}
                    </Badge>
                  )}
                  {locationFilter !== "all" && (
                    <Badge variant="secondary">
                      {locationFilter}
                    </Badge>
                  )}
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
                Try adjusting your search terms or filters to find more packages.
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