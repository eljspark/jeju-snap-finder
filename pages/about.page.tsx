import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Users } from "lucide-react";

function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">About Jeju Snap Finder</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            제주도에서 완벽한 스냅 촬영 경험을 찾아보세요
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <CardTitle>Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  제주도에서 특별한 순간을 포착할 수 있는 최고의 스냅 촬영 
                  서비스를 한곳에 모아 제공합니다. 커플, 가족, 우정 등 
                  모든 특별한 순간을 아름답게 기록하세요.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-primary" />
                  <CardTitle>Our Values</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  고객의 소중한 추억을 최우선으로 생각하며, 전문성과 
                  창의성을 바탕으로 최고 품질의 사진을 제공하는 것을 
                  목표로 합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <CardTitle>Our Team</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  제주도 전역의 우수한 사진작가들과 협력하여 
                  다양한 스타일과 전문성을 갖춘 촬영 서비스를 
                  제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Content */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Us?</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                인스타그램, 네이버에서 일일이 상품을 찾고 가격을 비교할 필요 없이
                제주 스냅 파인더에서 한눈에 찾아보세요.
              </p>
              <p>
                제주스냅 사진작가들의 포트폴리오를 한눈에 비교하고, 
                촬영 스타일과 가격대를 쉽게 확인할 수 있습니다. 
                예약하기를 누르면 예악 사이트로 바로 이동할 수 있어요.
              </p>
              <p>
                제주도의 아름다운 자연을 배경으로, 여러분의 특별한 순간을 
                영원히 간직할 수 있는 추억을 찾아드려요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default { Page };
