import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PackageImageGallery } from "@/components/PackageImageGallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const PackageDetail = () => {
  const { id } = useParams();

  // Fetch package data from Supabase
  const { data: packageData, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      if (!id) throw new Error('Package ID is required');
      
      const { data, error } = await supabase
        .from('packages')
        .select('id, title, price_krw, duration_minutes, occasions, thumbnail_url, details, folder_path')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        price: data.price_krw,
        duration: data.duration_minutes ? `${data.duration_minutes} minutes` : "Duration TBD",
        occasions: data.occasions || [],
        folderPath: data.folder_path || `packages/${data.id}/`,
        thumbnailUrl: data.thumbnail_url || "/placeholder.svg",
        description: data.details || "No description available",
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
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading package details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Package not found</h2>
            <p className="text-muted-foreground mb-4">The package you're looking for doesn't exist.</p>
            <Link to="/packages">
              <Button>Back to Packages</Button>
            </Link>
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
      <Navbar />
      
      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/packages" className="hover:text-primary">Packages</Link>
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
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Title & Basic Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{packageData.title}</h1>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{packageData.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">About This Session</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {packageData.description}
                </p>
              </div>

              {/* Sample Photos Gallery */}
              <PackageImageGallery 
                folderPath={packageData.folderPath} 
                packageTitle={packageData.title} 
              />

            </div>

            {/* Right Column - Booking & Photographer Info */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-24 shadow-medium">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-primary">₩{packageData.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">per session</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    Book This Session
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Photographer
                  </Button>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meeting Point:</span>
                      <span className="text-right">{packageData.meetingPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancellation:</span>
                      <span className="text-right">48h free</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photographer Card */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Your Photographer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={packageData.photographer.avatar} 
                      alt={packageData.photographer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{packageData.photographer.name}</h4>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{packageData.photographer.rating} ({packageData.photographer.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience:</span>
                      <span>{packageData.photographer.experience}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Specialties:</span>
                    <div className="flex flex-wrap gap-1">
                      {packageData.photographer.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Photographer
                  </Button>
                </CardContent>
              </Card>

              {/* Policy Card */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {packageData.cancellationPolicy}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PackageDetail;