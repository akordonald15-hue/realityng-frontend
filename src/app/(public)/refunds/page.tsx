import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { refundsPage } from "@/lib/public-info-pages";

export const metadata: Metadata = {
  title: "Refunds and Cancellations | RealityNG",
  description: "Understand current RealityNG payment, refund, and cancellation limitations.",
};

export default function RefundsPage() {
  return <PublicInfoPage {...refundsPage} />;
}
