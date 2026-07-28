import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { dataDeletionPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Data Deletion | RealityNG",
  description: "Learn how to request RealityNG account or personal-data support.",
};

export default function DataDeletionPage() {
  return <PublicInfoPage {...dataDeletionPage} />;
}
