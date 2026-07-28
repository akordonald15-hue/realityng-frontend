import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { termsPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Terms | RealityNG",
  description: "Review RealityNG platform terms and responsible-use expectations.",
};

export default function TermsPage() {
  return <PublicInfoPage {...termsPage} />;
}
