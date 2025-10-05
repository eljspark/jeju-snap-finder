export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-8 leading-relaxed">
      <h1 className="text-2xl font-bold mb-4">개인정보 처리방침 (Privacy Policy)</h1>
      <p>
        본 사이트는 Google AdSense를 사용하여 광고를 게재합니다.
        Google 및 제3자는 쿠키를 사용하여 사용자의 관심사에 맞는 광고를 표시할 수 있습니다.
      </p>
      <p>
        사용자는 <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
        Google 광고 설정</a> 페이지에서 맞춤 광고를 비활성화할 수 있습니다.
      </p>
      <p>
        본 사이트는 개인 정보를 상업적 목적으로 제3자에게 판매하거나 공유하지 않습니다.
        쿠키 사용 및 데이터 수집에 대한 더 자세한 내용은 Google의
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
        광고 정책</a>을 참고하시기 바랍니다.
      </p>
    </main>
  );
}
