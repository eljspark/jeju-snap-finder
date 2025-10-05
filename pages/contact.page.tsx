import React from "react";

function Page() {
  return (
    <main className="max-w-3xl mx-auto p-8 leading-relaxed">
      <h1 className="text-2xl font-bold mb-4">문의하기 (Contact)</h1>
      <p>제주스냅파인더에 대한 문의는 아래 이메일 주소로 연락해 주세요.</p>

      <div className="mt-6 p-4 bg-muted rounded-md">
        <p className="font-semibold text-lg">📧 이메일 문의</p>
        <p className="mt-2 text-blue-700">jisangellenpark@gmail.com</p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        회신은 영업일 기준 1~2일 내에 드리며, 광고 제안이나 제휴 문의도 환영합니다.
      </p>
    </main>
  );
}

export { Page };

export const documentProps = {
  title: "문의하기 | 제주스냅파인더",
  description:
    "제주스냅파인더 문의 페이지 - 이메일을 통한 연락 및 제휴 문의 안내.",
};

export default { Page, documentProps };
