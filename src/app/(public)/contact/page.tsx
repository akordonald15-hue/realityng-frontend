import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { contactPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Contact | RealityNG",
  description: "Contact RealityNG for marketplace support, trust and safety, or partnerships.",
};

export default function ContactPage() {
  return <PublicInfoPage {...contactPage} />;
}
