import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Camera, Users } from "lucide-react";

interface PackageCardProps {
  id: string;
  title: string;
  price: number;
  duration: string;
  occasions: string[];
  images: string[];
  featured?: boolean;
}

const PackageCard = ({
  id,
  title,
  price,
  duration,
  occasions,
  images,
  featured = false,
}: PackageCardProps) => {
  return (
    <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-medium ${
      featured ? 'ring-2 ring-primary/20 shadow-medium' : 'shadow-soft hover:shadow-medium'
    }`}>
    <CardHeader className="p-0">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={images?.[0] || "/placeholder.svg"}
          alt={title}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ height: "var(--package-thumbnail-height)" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
          {occasions?.map((occasion, index) => (
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

      <div className="flex items-center justify-between pt-3">
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">₩{price?.toLocaleString()}</span>
        </div>
        <a href={`/packages/${id}`}>
          <Button size="sm">
            자세히 보기
          </Button>
        </a>
      </div>
    </CardContent>
  </Card>
  );
};

export default PackageCard;
