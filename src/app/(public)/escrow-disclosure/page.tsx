import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public-info/public-info-page";
import { escrowDisclosurePage } from "@/lib/public-info-pages";
export const metadata: Metadata = { title: "Escrow Disclosure | RealityNG" };
export default function EscrowDisclosurePage() { return <PublicInfoPage {...escrowDisclosurePage} />; }
