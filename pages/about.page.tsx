import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { Camera, Heart, Users, Star, MapPin, Clock } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-12 pb-12 bg-gradient-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">제주 스냅 파인더 소개</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            제주도에서 가장 아름다운 순간을 남기세요
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* About Us */}
          <div>
            <h2 className="text-2xl font-bold mb-6">서비스 소개</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  제주 스냅 파인더는 제주도 전역의 우수한 사진 작가님들이 제공하는 
                  다양한 스냅 촬영 패키지를 한눈에 비교하고 예약할 수 있는 플랫폼입니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  인스타그램이나 네이버에서 웨딩스냅 위주로 검색 결과가 나와 
                  커플스냅, 가족스냅, 우정스냅을 찾기 어려웠던 경험이 있으신가요? 
                  저희는 이런 불편함을 해소하기 위해 다양한 테마의 스냅 촬영 
                  패키지를 한곳에 모아 제공합니다.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  제주도의 아름다운 풍경을 배경으로, 전문 사진 작가님들이 
                  여러분의 소중한 순간을 특별한 추억으로 남겨드립니다.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Services */}
          <div>
            <h2 className="text-2xl font-bold mb-6">제공 서비스</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-primary" />
                    <CardTitle>커플 스냅 촬영</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    연인과 함께하는 제주 여행의 로맨틱한 순간을 담아드립니다. 
                    해변, 카페, 숲길 등 다양한 배경에서 자연스러운 커플 사진을 
                    촬영합니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <CardTitle>가족 스냅 촬영</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    가족과 함께한 제주 여행의 따뜻한 순간들을 기록합니다. 
                    아이들의 자연스러운 모습부터 가족 단체사진까지 
                    소중한 추억을 남겨드립니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Camera className="h-8 w-8 text-primary" />
                    <CardTitle>만삭 및 아기 촬영</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    생애 가장 특별한 순간인 임신과 출산의 기억을 아름답게 
                    담아드립니다. 제주의 자연 속에서 편안하고 안전한 
                    촬영을 진행합니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-primary" />
                    <CardTitle>우정 및 개인 촬영</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    친구들과의 우정 여행이나 개인 프로필 촬영까지, 
                    다양한 목적의 촬영을 지원합니다. 자연스럽고 
                    감각적인 사진으로 당신만의 스토리를 담습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Why Choose Us */}
          <div>
            <h2 className="text-2xl font-bold mb-6">왜 제주 스냅 파인더인가요?</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. 다양한 테마의 패키지</h3>
                  <p className="text-muted-foreground">
                    커플, 가족, 우정, 만삭, 아기 등 다양한 촬영 테마를 
                    한눈에 비교하고 선택할 수 있습니다. 각 테마별로 
                    최적화된 패키지를 제공합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">2. 검증된 전문 작가</h3>
                  <p className="text-muted-foreground">
                    제주도에서 활동하는 경험 많은 전문 사진 작가님들의 
                    포트폴리오와 리뷰를 확인하고 선택할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">3. 투명한 가격 정보</h3>
                  <p className="text-muted-foreground">
                    모든 패키지의 가격, 촬영 시간, 포함 사항이 명확하게 
                    표시되어 있어 숨겨진 비용 없이 안심하고 예약할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">4. 간편한 예약 시스템</h3>
                  <p className="text-muted-foreground">
                    원하는 패키지를 선택하고 작가님과 직접 소통하여 
                    촬영 일정을 조율할 수 있습니다. 편리한 예약 프로세스로 
                    시간을 절약하세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Locations */}
          <div>
            <h2 className="text-2xl font-bold mb-6">인기 촬영 장소</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">협재 해수욕장</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    에메랄드빛 바다와 흰 모래사장이 아름다운 제주 대표 해변으로, 
                    특히 일몰 촬영에 최적입니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">성산일출봉</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    UNESCO 세계자연유산으로 지정된 명소로, 일출 촬영과 
                    웅장한 자연 배경의 사진에 인기가 많습니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">카페 거리</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    애월, 한림 등 감성적인 카페들이 모여있는 거리에서 
                    트렌디하고 세련된 분위기의 촬영이 가능합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h2 className="text-2xl font-bold mb-6">이용 방법</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">패키지 검색 및 선택</h3>
                      <p className="text-muted-foreground">
                        촬영 목적, 가격대, 위치 등으로 필터링하여 
                        원하는 스냅 촬영 패키지를 찾아보세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">작가님께 문의</h3>
                      <p className="text-muted-foreground">
                        마음에 드는 패키지를 찾으셨다면 '예약하기' 버튼을 
                        클릭하여 작가님과 직접 상담하세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">일정 및 세부사항 조율</h3>
                      <p className="text-muted-foreground">
                        촬영 날짜, 시간, 장소, 컨셉 등을 작가님과 
                        상의하여 확정합니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">촬영 진행</h3>
                      <p className="text-muted-foreground">
                        약속된 시간과 장소에서 전문 작가님과 함께 
                        즐겁고 편안한 촬영을 진행합니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">사진 수령</h3>
                      <p className="text-muted-foreground">
                        2-4주 후 보정이 완료된 고품질 사진을 
                        온라인 갤러리를 통해 다운로드 받으세요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips for Great Photos */}
          <div>
            <h2 className="text-2xl font-bold mb-6">멋진 사진을 위한 팁</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      최적의 촬영 시간
                    </h3>
                    <p className="text-muted-foreground">
                      골든아워(일출 직후, 일몰 1-2시간 전)가 가장 아름다운 
                      자연광을 제공합니다. 여름철 정오의 강한 햇빛은 피하는 것이 좋습니다.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">의상 준비</h3>
                    <p className="text-muted-foreground">
                      2-3벌의 의상을 준비하여 다양한 분위기를 연출하세요. 
                      촬영 장소의 배경색과 대비되는 색상을 선택하면 더욱 돋보입니다.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">편안한 자세</h3>
                    <p className="text-muted-foreground">
                      어색한 포즈보다는 자연스러운 움직임과 표정이 더 좋은 
                      사진을 만듭니다. 작가님의 지시에 따라 편안하게 촬영에 임하세요.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">소품 활용</h3>
                    <p className="text-muted-foreground">
                      풍선, 꽃다발, 모자 등의 소품은 사진에 포인트를 주고 
                      다양한 연출을 가능하게 합니다. 작가님과 미리 상의해보세요.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
