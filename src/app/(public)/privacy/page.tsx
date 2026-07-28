import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { privacyPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Privacy | RealityNG",
  description: "Review RealityNG privacy principles for accounts, workflows, and verification evidence.",
};

export default function PrivacyPage() {
  return <PublicInfoPage {...privacyPage} />;
}
