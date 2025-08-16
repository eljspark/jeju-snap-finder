import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Camera, Users } from "lucide-react";

interface PackageCardProps {
  id: string;
  title: string;
  photographer: string;
  price: number;
  duration: string;
  location: string;
  occasion: string;
  maxPeople: number;
  images: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
}

const PackageCard = ({
  id,
  title,
  photographer,
  price,
  duration,
  location,
  occasion,
  maxPeople,
  images,
  rating,
  reviewCount,
  featured = false,
}: PackageCardProps) => {
  return (
    <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-medium ${
      featured ? 'ring-2 ring-primary/20 shadow-medium' : 'shadow-soft hover:shadow-medium'
    }`}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={images[0] || "/placeholder.svg"}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              {occasion}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">by {photographer}</p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Up to {maxPeople} people</span>
          </div>
          <div className="flex items-center space-x-1">
            <Camera className="h-4 w-4" />
            <span>{rating} ⭐ ({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">₩{price.toLocaleString()}</span>
            <p className="text-xs text-muted-foreground">per session</p>
          </div>
          <Button asChild size="sm">
            <Link to={`/packages/${id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;