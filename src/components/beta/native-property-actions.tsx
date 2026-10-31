"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth, useOptionalAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api/client";
import { betaCommand, getBetaPayments } from "@/lib/api/beta-listing-payments";
import { createInquiry, inquiryTypeForListing } from "@/lib/api/inquiries";
import { createThread } from "@/lib/api/messages";
import type { Property } from "@/lib/api/properties";

export function NativePropertyContact({ property }: { property: Property }) {
  const user = useOptionalAuth()?.user;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!user?.is_beta_test_account || !user.beta_native_enabled || property.beta_is_owner) return null;
  async function contact(target: "owner" | "agent") {
    setBusy(true); setError("");
    try {
      const inquiry = await createInquiry({ property_id: property.id, inquiry_type: inquiryTypeForListing(property.listing_type), contact_preference: "email", message: "Synthetic beta viewing enquiry" });
      const thread = await createThread({ property: property.id, inquiry: inquiry.id, target });
      router.push(`/dashboard/messages/${thread.id}`);
    } catch { setError("This conversation is unavailable. Check the current listing and agent assignment."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 space-y-3">
    <Button disabled={busy} onClick={() => void contact("owner")}>Message owner</Button>
    {property.beta_agent_available && <Button disabled={busy} onClick={() => void contact("agent")}>Message assigned agent</Button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}

export function NativeAgentAssignment({ propertySlug }: { propertySlug: string }) {
  const user = useOptionalAuth()?.user;
  const cache = useQueryClient();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const enabled = Boolean(user?.is_beta_test_account && user.beta_native_enabled);
  const query = useQuery({ queryKey: ["beta-listing-payments", user?.id], queryFn: getBetaPayments, enabled });
  const listing = query.data?.listings.find(item => item.property__slug === propertySlug && item.participant_id === query.data.member_id);
  if (!enabled || !listing) return null;
  async function update(action: string) {
    setBusy(true); setError("");
    try { await betaCommand({ action, listing_id: listing!.id, ...(action === "assign-agent" ? { agent_id: selected } : {}) }); await cache.invalidateQueries({ queryKey: ["beta-listing-payments"] }); }
    catch { setError("The assignment could not be changed."); }
    finally { setBusy(false); }
  }
  return <Card className="mx-auto my-6 max-w-5xl space-y-4 p-5">
    <h2 className="text-xl font-semibold">Agent assignment</h2>
    <label className="block">Approved agent<select className="ml-3 rounded border p-2" value={selected} onChange={event => setSelected(event.target.value)}><option value="">Choose an agent</option>{query.data?.agents.map(agent => <option key={agent.id} value={agent.id}>{agent.user__first_name} · Agent {agent.id}</option>)}</select></label>
    <Button disabled={busy || !selected} onClick={() => void update("assign-agent")}>Assign agent</Button>
    {listing.assigned_agent_id && <Button disabled={busy} onClick={() => void update("revoke-agent")}>Revoke assignment</Button>}
    {error && <p role="alert">{error}</p>}
  </Card>;
}

export function NativeModerationQueue() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const query = useQuery({ queryKey: ["native-moderation", user?.id], queryFn: async () => (await apiClient.get<{ results: Property[] }>("/properties/", { params: { status: "pending_review" } })).data.results, enabled: Boolean(user?.beta_native_enabled && user.beta_native_role === "admin") });
  if (!user?.beta_native_enabled || user.beta_native_role !== "admin") return null;
  return <Card className="mx-auto my-6 max-w-7xl space-y-4 p-5">
    <h2 className="text-2xl font-semibold">Property moderation</h2><p>This beta moderator can review approved synthetic records only.</p>
    {(error || query.isError) && <p role="alert">{error || "The moderation queue could not load."}</p>}
    {query.data?.map(property => <article className="space-y-3 rounded border p-4" key={property.id}><h3>{property.title}</h3><div className="flex gap-3">{["approve", "reject"].map(action => <Button key={action} disabled={busy} onClick={async () => { setBusy(true); setError(""); try { await apiClient.post(`/properties/${property.slug}/${action}/`, {}); await query.refetch(); } catch { setError("The moderation decision was rejected."); } finally { setBusy(false); } }}>{action === "approve" ? "Approve and publish" : "Reject"}</Button>)}</div></article>)}
  </Card>;
}
