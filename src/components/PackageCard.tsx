import { Link } from "react-router-dom";
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
    <Link to={`/packages/${id}`} className="block">
      <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-medium h-[300px] flex flex-col ${
        featured ? 'ring-2 ring-primary/20 shadow-medium' : 'shadow-soft hover:shadow-medium'
      }`}>
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={images[0] || "/placeholder.svg"}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
            {occasions.map((occasion, index) => (
              <Badge key={index} variant="secondary" className="bg-background/90 text-foreground">
                {occasion}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors flex-1 mr-2">
            {title}
          </h3>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground shrink-0">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-right">
            <span className="text-xl font-bold text-primary">₩{price.toLocaleString()}</span>
            <p className="text-xs text-muted-foreground">회당</p>
          </div>
          <Button size="sm">
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};

export default PackageCard;