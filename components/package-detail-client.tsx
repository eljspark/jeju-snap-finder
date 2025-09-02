"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageImageGallery from "@/components/PackageImageGallery";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

interface PackageDetailClientProps {
  packageData: PackageData;
}

export default function PackageDetailClient({ packageData }: PackageDetailClientProps) {
  const handleReservation = () => {
    window.open(packageData.reservationUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
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
              <Image
                src={packageData.thumbnailUrl}
                alt={packageData.title}
                fill
                className="object-cover"
                priority
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
}