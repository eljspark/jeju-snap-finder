import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export const SEOHead = ({
  title = "제주 스냅 사진 전문 업체 찾기 - JejuSnapFinder",
  description = "제주도 여행 스냅 사진 전문 업체를 쉽게 찾아보세요. 커플, 가족, 우정, 만삭, 아기 촬영 전문 스튜디오 정보와 예약까지 한번에!",
  keywords = "제주도 스냅사진, 제주 여행사진, 커플스냅, 가족사진, 제주 사진작가, 제주 포토스튜디오",
  image = "/hero-jeju.jpg",
  url = "https://jejusnapfinder.com",
  type = "website",
  structuredData,
}: SEOHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="제주도 스냅 사진" />
      <meta property="og:site_name" content="JejuSnapFinder" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};