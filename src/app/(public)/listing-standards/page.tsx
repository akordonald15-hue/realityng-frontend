import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { listingStandardsPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Listing Standards | RealityNG",
  description: "Review RealityNG listing quality, media, availability, and trust-signal standards.",
};

export default function ListingStandardsPage() {
  return <PublicInfoPage {...listingStandardsPage} />;
}
