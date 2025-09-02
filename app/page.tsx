import { supabase } from "@/integrations/supabase/client";
import { formatThumbnailUrl, formatDuration } from "@/lib/utils";
import PackagesClient from "@/components/packages-client";

async function getPackages() {
  const { data, error } = await supabase
    .from('packages')
    .select('*');
  
  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
  
  return data.map(pkg => ({
    id: pkg.id,
    title: pkg.title,
    price: pkg.price_krw,
    duration: pkg.duration_minutes ? formatDuration(pkg.duration_minutes) : "촬영 시간 미정",
    occasions: pkg.occasions || ["Photography"],
    images: [formatThumbnailUrl(pkg.thumbnail_url)],
    featured: false,
  }));
}

export default async function Home() {
  const packages = await getPackages();

  return <PackagesClient initialPackages={packages} />;
}

export const metadata = {
  title: "SnapFinder - 제주 인기 스냅들을 한눈에!",
  description: "제주도 커플스냅, 가족스냅, 우정스냅을 쉽게 찾아보세요. 인스타와 네이버에서 찾기 힘든 다양한 스냅 패키지들을 한곳에서 만나보세요.",
  openGraph: {
    title: "SnapFinder - 제주 인기 스냅들을 한눈에!",
    description: "제주도 커플스냅, 가족스냅, 우정스냅을 쉽게 찾아보세요."
  }
};