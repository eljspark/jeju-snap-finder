mport React from "react";

function Page() {
  return (
    <main className="max-w-3xl mx-auto p-8 leading-relaxed">
      <h1 className="text-2xl font-bold mb-4">사이트 소개 (About)</h1>
      <p>
        제주스냅파인더는 제주도에서 활동하는 다양한 스냅 작가님들의 정보를
        한곳에 모아 보여주는 플랫폼입니다. 커플, 가족, 우정, 웨딩 등 목적에 맞는
        촬영 패키지를 비교하고 선택할 수 있습니다.
      </p>
      <p className="mt-4">
        본 사이트는 광고 수익(Google AdSense)을 기반으로 운영되며,
        사용자에게 유용한 정보를 제공하기 위해 지속적으로 개선되고 있습니다.
      </p>
    </main>
  );
}

export { Page };

export const documentProps = {
  title: "사이트 소개 | 제주스냅파인더",
  description:
    "제주스냅파인더 소개 - 제주도 스냅 촬영 작가 및 패키지 정보를 한눈에.",
};

export default { Page, documentProps };
