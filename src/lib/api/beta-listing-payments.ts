import { apiClient } from "@/lib/api/client";

export type BetaListing = { id: string; title: string; property_id: string; property__slug: string; state: string; participant_id: number; assigned_agent_id: number | null; premium_until: string | null };
export type BetaPayments = {
  notice: string; role: string; member_id: number; require_password_change: boolean;
  packages: { code: string; amount_minor: number; credits: number; valid_days: number }[];
  premium: { code: string; amount_minor: number; days: number }[];
  orders: { id: string; product: string; amount_minor: number; status: string }[];
  lots: { id: number; remaining: number; reserved: number }[];
  listings: BetaListing[];
  agents: { id: number; user__first_name: string }[];
};
export type BetaCommand = Record<string, string>;
export async function getBetaPayments() {
  return (await apiClient.get<BetaPayments>("/beta/listing-payments/")).data;
}
export async function betaCommand(command: BetaCommand) {
  return (await apiClient.post<BetaPayments>("/beta/listing-payments/", command)).data;
}
