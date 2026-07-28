import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { aboutPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "About RealityNG",
  description: "Learn how RealityNG supports trust-first Nigerian property discovery.",
};

export default function AboutPage() {
  return <PublicInfoPage {...aboutPage} />;
}
