import React from "react";

function Page() {
  return (
    <main className="max-w-3xl mx-auto p-8 leading-relaxed">
      <h1 className="text-2xl font-bold mb-4">이용약관 (Terms of Service)</h1>
      <p>
        본 사이트를 이용함으로써 사용자는 아래의 약관에 동의하게 됩니다.
        본 사이트는 사진 스냅 정보 제공 및 광고 게재를 목적으로 운영됩니다.
      </p>
      <p>
        사이트의 콘텐츠(텍스트, 이미지, 데이터 등)는 저작권법에 의해 보호되며,
        무단 복제, 배포, 수정, 상업적 이용을 금합니다.
      </p>
      <p>
        본 사이트는 Google AdSense를 통해 광고를 게재하며,
        광고 클릭 또는 이용에 따른 모든 거래는 광고주와 사용자 간의 책임입니다.
      </p>
      <p>본 약관은 사전 공지 없이 변경될 수 있으며, 변경 사항은 본 페이지에 공지됩니다.</p>
    </main>
  );
}

export { Page };

export const documentProps = {
  title: "이용약관 | 제주스냅파인더",
  description: "제주스냅파인더 이용약관 - 사이트 이용 및 저작권, 광고 관련 정책 안내.",
};

export default { Page, documentProps };
