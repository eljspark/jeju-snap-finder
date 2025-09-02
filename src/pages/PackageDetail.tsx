import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageImageGallery from "@/components/PackageImageGallery";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";

interface PackageData {
  id: string;
  title: string;
  price: number;
  duration: string;
  occasions: string[];
  thumbnailUrl: string;
  reservationUrl: string;
  details?: string;
  folderPath?: string;
  sampleImageUrls: string[];
}

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setPackageData({
            id: data.id,
            title: data.title,
            price: data.price_krw,
            duration: data.duration_minutes ? formatDuration(data.duration_minutes) : "촬영 시간 미정",
            occasions: data.occasions || [],
            thumbnailUrl: formatThumbnailUrl(data.thumbnail_url),
            reservationUrl: data.reservation_url,
            details: data.details,
            folderPath: data.folder_path,
            sampleImageUrls: data.sample_image_urls || [],
          });
        }
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  const handleReservation = () => {
    if (packageData?.reservationUrl) {
      window.open(packageData.reservationUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">패키지 정보를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">패키지를 찾을 수 없습니다</h1>
          <Link to="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              패키지 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>

      {/* Package Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
              <img
                src={packageData.thumbnailUrl}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{packageData.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {packageData.occasions.map((occasion, index) => (
                  <Badge key={index} variant="secondary">
                    {occasion}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{packageData.duration}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary mb-6">
                {packageData.price.toLocaleString()}원
              </div>

              {packageData.details && (
                <div className="prose prose-sm max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-foreground">
                    {packageData.details}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleReservation} 
                size="lg" 
                className="w-full"
              >
                예약하기
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sample Images Gallery */}
        {packageData.folderPath && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">샘플 사진</h2>
            <PackageImageGallery 
              folderPath={packageData.folderPath} 
              packageTitle={packageData.title} 
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PackageDetail;