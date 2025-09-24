import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Camera, Users } from "lucide-react";
import { formatThumbnailUrl } from "@/lib/utils";
import { useState } from "react";

interface PackageCardProps {
  id: string;
  title: string;
  price: number;
  duration: string;
  occasions: string[];
  images: string[];
  thumbnail_url?: string;
  featured?: boolean;
}

const PackageCard = ({
  id,
  title,
  price,
  duration,
  occasions,
  images,
  thumbnail_url,
  featured = false,
}: PackageCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use first image or formatted thumbnail_url as fallback
  const imageSource = images[0] || formatThumbnailUrl(thumbnail_url) || "/placeholder.svg";
  
  return (
    <a href={`/packages/${id}`} className="block">
      <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-medium ${
        featured ? 'ring-2 ring-primary/20 shadow-medium' : 'shadow-soft hover:shadow-medium'
      }`}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Skeleton/Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div 
              className="w-full bg-muted animate-pulse flex items-center justify-center"
              style={{ height: "var(--package-thumbnail-height)" }}
            >
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <img
            src={imageSource}
            alt={`${title} 패키지 썸네일`}
            className={`w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ height: "var(--package-thumbnail-height)" }}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {/* Error fallback */}
          {imageError && (
            <div 
              className="absolute inset-0 w-full bg-muted flex items-center justify-center"
              style={{ height: "var(--package-thumbnail-height)" }}
            >
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
            {occasions.map((occasion, index) => (
              <Badge key={index} variant="secondary" className="bg-background/90 text-foreground">
                {occasion}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors flex-1 mr-2">
            {title}
          </h3>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground shrink-0">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">₩{price.toLocaleString()}</span>
          </div>
          <Button size="sm">
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
    </a>
  );
};

export default PackageCard;