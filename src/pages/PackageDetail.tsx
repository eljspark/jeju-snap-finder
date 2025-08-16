import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  // Mock data - in real app this would come from API
  const packageData = {
    id: "1",
    title: "Romantic Sunset Couple Session at Hyeopjae Beach",
    photographer: {
      name: "Kim Min-jun",
      avatar: "/placeholder.svg",
      rating: 4.9,
      reviewCount: 127,
      experience: "5 years",
      specialties: ["Couple Photography", "Beach Sessions", "Golden Hour"]
    },
    price: 180000,
    duration: "2 hours",
    location: "Hyeopjae Beach, Jeju",
    occasion: "Couple",
    maxPeople: 2,
    images: [
      "/placeholder.svg",
      "/placeholder.svg", 
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    rating: 4.9,
    reviewCount: 127,
    description: "Experience the magic of Jeju's most beautiful beach during golden hour. This romantic couple session captures intimate moments against the stunning backdrop of Hyeopjae Beach's crystal-clear waters and dramatic coastline. Perfect for anniversaries, proposals, or celebrating your love story.",
    included: [
      "2-hour professional photography session",
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
              {/* Photo Gallery */}
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={packageData.images[0]} 
                    alt={packageData.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-accent-foreground">
                      {packageData.occasion}
                    </Badge>
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
                
                <div className="grid grid-cols-3 gap-2">
                  {packageData.images.slice(1).map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Gallery ${index + 2}`}
                        className="w-full h-24 object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Basic Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{packageData.title}</h1>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{packageData.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{packageData.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Up to {packageData.maxPeople} people</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{packageData.rating} ({packageData.reviewCount} reviews)</span>
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

              {/* What's Included */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What's Included</h3>
                  <ul className="space-y-2">
                    {packageData.included.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Not Included</h3>
                  <ul className="space-y-2">
                    {packageData.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0">×</span>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photography Tips</h3>
                <ul className="space-y-2">
                  {packageData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Camera className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reviews */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Reviews ({packageData.reviewCount})</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{review.name}</h4>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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