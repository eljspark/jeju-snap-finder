import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import { PackageImageGallery } from "@/components/PackageImageGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";
import { 
  MapPin, 
  Clock, 
  Camera, 
  Users, 
  Star, 
  Check, 
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  Phone
} from "lucide-react";

interface PackageDetailProps {
  packageData?: any;
  packageId?: string;
}

const PackageDetail = ({ packageData: staticPackageData, packageId }: PackageDetailProps) => {

  // Fetch package data from Supabase with static data fallback
  const { data: queryPackageData, isLoading } = useQuery({
    queryKey: ['package', packageId],
    queryFn: async () => {
      if (!packageId) throw new Error('Package ID is required');
      
      const { data, error } = await supabase
        .from('packages')
        .select('id, title, price_krw, duration_minutes, occasions, thumbnail_url, details, folder_path, reservation_url')
        .eq('id', packageId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        price: data.price_krw,
        duration: data.duration_minutes ? formatDuration(data.duration_minutes) : "촬영 시간 미정",
        occasions: data.occasions || [],
        folderPath: data.folder_path || data.id,
        thumbnailUrl: formatThumbnailUrl(data.thumbnail_url),
        description: data.details || "No description available",
        reservationUrl: data.reservation_url,
        // Mock data for fields not in database yet
        photographer: {
          name: "Kim Min-jun",
          avatar: "/placeholder.svg",
          rating: 4.9,
          reviewCount: 127,
          experience: "5 years",
          specialties: ["Couple Photography", "Beach Sessions", "Golden Hour"]
        },
        location: "Hyeopjae Beach, Jeju",
        maxPeople: 2,
        rating: 4.9,
        reviewCount: 127,
        included: [
          "Professional photography session",
          "50+ high-resolution edited photos",
          "Online gallery with download links",
          "Print release for personal use",
          "Complimentary location scouting",
          "Backup photographer available"
        ],
        notIncluded: [
          "Transportation to location",
          "Hair and makeup services",
          "Additional outfit changes",
          "Physical prints (available for purchase)"
        ],
        meetingPoint: "Hyeopjae Beach Parking Area",
        cancellationPolicy: "Free cancellation up to 48 hours before the session. Weather-related cancellations are fully refundable.",
        tips: [
          "Best time is 1-2 hours before sunset",
          "Bring multiple outfit options",
          "Comfortable shoes for beach walking",
          "Props and accessories welcome"
        ]
      };
    },
    enabled: !!packageId,
    initialData: staticPackageData ? {
      ...staticPackageData,
      folderPath: staticPackageData.folder_path || staticPackageData.id,
      thumbnailUrl: formatThumbnailUrl(staticPackageData.thumbnail_url),
      description: staticPackageData.details || "No description available",
      reservationUrl: staticPackageData.reservation_url,
      // Mock data for fields not in database yet
      photographer: {
        name: "Kim Min-jun",
        avatar: "/placeholder.svg",
        rating: 4.9,
        reviewCount: 127,
        experience: "5 years",
        specialties: ["Couple Photography", "Beach Sessions", "Golden Hour"]
      },
      location: "Hyeopjae Beach, Jeju",
      maxPeople: 2,
      rating: 4.9,
      reviewCount: 127,
      included: [
        "Professional photography session",
        "50+ high-resolution edited photos",
        "Online gallery with download links",
        "Print release for personal use",
        "Complimentary location scouting",
        "Backup photographer available"
      ],
      notIncluded: [
        "Transportation to location",
        "Hair and makeup services",
        "Additional outfit changes",
        "Physical prints (available for purchase)"
      ],
      meetingPoint: "Hyeopjae Beach Parking Area",
      cancellationPolicy: "Free cancellation up to 48 hours before the session. Weather-related cancellations are fully refundable.",
      tips: [
        "Best time is 1-2 hours before sunset",
        "Bring multiple outfit options",
        "Comfortable shoes for beach walking",
        "Props and accessories welcome"
      ]
    } : undefined,
    staleTime: staticPackageData ? 5 * 60 * 1000 : 0, // 5 minutes if we have static data
  });

  // Use static data if available, otherwise use query data
  const packageData = staticPackageData ? 
    queryPackageData || staticPackageData : 
    queryPackageData;

  if (isLoading && !staticPackageData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">패키지 정보 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">패키지를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-4">찾고 있는 패키지가 존재하지 않습니다.</p>
            <a href="/packages">
              <Button>패키지 목록으로</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const reviews = [
    {
      id: 1,
      name: "Sarah & John",
      rating: 5,
      date: "2024-01-15",
      comment: "Absolutely magical experience! Min-jun captured our love story perfectly against the stunning Jeju sunset. The photos are breathtaking and we couldn't be happier!"
    },
    {
      id: 2,
      name: "Emma Kim", 
      rating: 5,
      date: "2024-01-10",
      comment: "Professional, creative, and so much fun to work with. The beach location was perfect and the golden hour timing made for incredible photos."
    },
    {
      id: 3,
      name: "Michael & Lisa",
      rating: 4,
      date: "2024-01-05", 
      comment: "Great photographer with excellent knowledge of the best spots at Hyeopjae Beach. Photos turned out beautiful, though weather wasn't perfect that day."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-8">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">패키지</a>
            <span>/</span>
            <span className="text-foreground">{packageData.title}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photos & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image with Badges */}
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={packageData.thumbnailUrl} 
                    alt={packageData.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="flex flex-wrap gap-2">
                      {packageData.occasions.map((occasion, index) => (
                        <Badge key={index} className="bg-accent text-accent-foreground">
                          {occasion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Basic Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{packageData.title}</h1>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{packageData.duration}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary lg:hidden">
                      ₩{packageData.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Photos Gallery */}
              <PackageImageGallery 
                folderPath={packageData.folderPath} 
                packageTitle={packageData.title} 
              />

            </div>

            {/* Right Column - Empty for now */}
            <div className="space-y-6">
              {/* Additional content can be added here later */}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Reservation Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Button 
          className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            let url = packageData.reservationUrl;
            
            // Handle different URL formats
            if (url.startsWith('카카오톡:')) {
              // For KakaoTalk links, show alert with instructions
              alert(`카카오톡 ID: ${url.replace('카카오톡:', '')}`);
              return;
            }
            
            // Ensure URL has proper protocol
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = `https://${url}`;
            }
            
            // Try multiple methods to open the link
            try {
              // Method 1: Direct window.open with specific parameters
              const newWindow = window.open(url, '_blank', 'noopener=yes,noreferrer=yes,width=800,height=600');
              
              // If window.open fails, try alternative method
              if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                // Method 2: Create a temporary link and click it
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            } catch (error) {
              console.error('Failed to open reservation link:', error);
              // Fallback: Copy URL to clipboard
              navigator.clipboard.writeText(url).then(() => {
                alert(`링크가 복사되었습니다: ${url}`);
              });
            }
          }}
        >
          예약하기
        </Button>
      </div>

      {/* Package Description */}
      <div className="bg-muted/50 py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-4">상품구성</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {packageData.description}
          </p>
        </div>
      </div>

      {/* Copyright Message */}
      <div className="bg-muted py-6 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            모든 사진과 상품의 저작권은 {packageData.title}에 있습니다.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PackageDetail;