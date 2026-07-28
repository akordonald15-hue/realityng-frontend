import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { helpPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Help | RealityNG",
  description: "Find the right RealityNG workflow for browsing, inquiries, viewings, and applications.",
};

export default function HelpPage() {
  return <PublicInfoPage {...helpPage} />;
}
