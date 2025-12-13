import { supabase } from "@/integrations/supabase/client";

interface TrackReservationClickParams {
  packageId: string;
  packageTitle: string;
  priceKrw?: number;
}

// Track reservation click to Supabase
export const trackReservationClick = async ({
  packageId,
  packageTitle,
  priceKrw,
}: TrackReservationClickParams) => {
  try {
    // Log to Supabase
    const { error } = await supabase.from("reservation_clicks").insert({
      package_id: packageId,
      package_title: packageTitle,
      price_krw: priceKrw,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    });

    if (error) {
      console.error("Failed to track reservation click:", error);
    }

    // Track to Google Analytics 4 (if gtag is available)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "reservation_click", {
        event_category: "engagement",
        event_label: packageTitle,
        package_id: packageId,
        package_title: packageTitle,
        price: priceKrw,
      });
    }

    console.log("Reservation click tracked:", { packageId, packageTitle, priceKrw });
  } catch (error) {
    console.error("Error tracking reservation click:", error);
  }
};
