import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Image as ImageIcon } from "lucide-react";

interface PackageImageGalleryProps {
  folderPath: string;
  packageTitle: string;
}

interface StorageImage {
  name: string;
  url: string;
}

export function PackageImageGallery({ folderPath, packageTitle }: PackageImageGalleryProps) {
  // Skip rendering during SSR - show skeleton
  if (typeof window === 'undefined') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">대표사진</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!folderPath) return;

      try {
        setLoading(true);
        setError(null);

        // Normalize folder path: remove 'packages/' prefix and ensure no trailing slash
        let normalizedPath = folderPath.replace(/^packages\//, "").replace(/\/$/, "");

        // List all files in the folder
        const { data: files, error: listError } = await supabase.storage.from("packages").list(normalizedPath, {
          limit: 30,
          sortBy: { column: "name", order: "asc" },
        });

        if (listError) {
          throw listError;
        }

        if (!files || files.length === 0) {
          setImages([]);
          return;
        }

        // Filter for image files only
        const imageFiles = files.filter((file) => file.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name));

        // Get public URLs for each image
        const imagePromises = imageFiles.map(async (file) => {
          // Use normalized path for public URL
          const fullPath = `${normalizedPath}/${file.name}`;
          const { data } = supabase.storage.from("packages").getPublicUrl(fullPath);

          return {
            name: file.name,
            url: data.publicUrl,
          };
        });

        const imageUrls = await Promise.all(imagePromises);
        setImages(imageUrls);
      } catch (err) {
        console.error("Error fetching package images:", err);
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [folderPath]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">대표사진</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No sample photos available for this package</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">대표사진 ({images.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card key={image.name} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={image.url}
                alt={`${packageTitle} sample photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
