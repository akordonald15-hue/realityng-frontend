import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { fraudReportingPage } from "@/lib/public-info-pages";
export const metadata: Metadata = { title: "Report Fraud or Abuse | RealityNG" };
export default function FraudReportingPage() { return <PublicInfoPage {...fraudReportingPage} />; }
