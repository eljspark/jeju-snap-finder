import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";
import PackageDetailClient from "@/components/package-detail-client";
import { notFound } from "next/navigation";

async function getPackage(id: string) {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
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
  };
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('packages')
    .select('id');

  return data?.map((pkg) => ({
    id: pkg.id,
  })) ?? [];
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const packageData = await getPackage(params.id);

  if (!packageData) {
    return {
      title: "패키지를 찾을 수 없습니다 - SnapFinder",
    };
  }

  return {
    title: `${packageData.title} - SnapFinder`,
    description: `${packageData.title} 패키지 상세 정보. 가격: ${packageData.price.toLocaleString()}원, 촬영시간: ${packageData.duration}. 제주도 스냅 촬영 예약하기.`,
    openGraph: {
      title: `${packageData.title} - SnapFinder`,
      description: `${packageData.title} 패키지 상세 정보. 가격: ${packageData.price.toLocaleString()}원`,
      images: packageData.thumbnailUrl ? [packageData.thumbnailUrl] : [],
    },
  };
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const packageData = await getPackage(params.id);

  if (!packageData) {
    notFound();
  }

  return <PackageDetailClient packageData={packageData} />;
}