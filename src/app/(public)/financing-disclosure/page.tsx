import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { financingDisclosurePage } from "@/lib/public-info-pages";
export const metadata: Metadata = { title: "Financing Disclosure | RealityNG" };
export default function FinancingDisclosurePage() { return <PublicInfoPage {...financingDisclosurePage} />; }
