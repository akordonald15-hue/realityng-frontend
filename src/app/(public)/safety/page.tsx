import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { safetyPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Safety | RealityNG",
  description: "Review RealityNG safety guidance for property discovery and engagement.",
};

export default function SafetyPage() {
  return <PublicInfoPage {...safetyPage} />;
}
