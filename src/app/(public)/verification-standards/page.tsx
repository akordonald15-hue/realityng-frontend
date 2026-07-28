import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { verificationStandardsPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Verification Standards | RealityNG",
  description: "Understand RealityNG verification signals, limitations, and document privacy.",
};

export default function VerificationStandardsPage() {
  return <PublicInfoPage {...verificationStandardsPage} />;
}
