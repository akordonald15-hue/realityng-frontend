"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { betaCommand, getBetaPayments, type BetaCommand } from "@/lib/api/beta-listing-payments";

const money = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount / 100);
export function ListingPayments() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState<BetaCommand | null>(null);
  const [error, setError] = useState("");
  const enabled = Boolean(user?.is_beta_test_account && user.beta_native_enabled);
  const query = useQuery({ queryKey: ["beta-listing-payments", user?.id], queryFn: getBetaPayments, enabled });
  async function run(command: BetaCommand) {
    setBusy(true); setError(""); setRetry(null);
    try { cache.setQueryData(["beta-listing-payments", user?.id], await betaCommand(command)); }
    catch { setError("The simulation was rejected or its result is uncertain. Refresh before retrying the same request."); setRetry(command); }
    finally { setBusy(false); }
  }
  const data = query.data;
  if (!enabled) return <p className="p-6">Simulated listing payments are available only to approved synthetic beta accounts.</p>;
  return <section className="mx-auto max-w-5xl space-y-6 px-5 py-8">
    <h1 className="text-3xl font-semibold">Listing packages and payments</h1>
    <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-bold" role="note">DEMO PAYMENT — NO MONEY CHARGED</p>
    <p>Proposed prices and policy, for controlled-beta testing only. These credits and promotions have no financial value.</p>
    {query.isPending && <p role="status">Loading listing payments…</p>}
    {(error || query.isError) && <p role="alert">{error || "Beta access is unavailable."}</p>}
    <Button disabled={busy} onClick={() => void query.refetch()}>Refresh payment status</Button>
    {retry && <Button disabled={busy} onClick={() => void run(retry)}>Retry same request</Button>}
    {data && <>
      <div className="grid gap-4 sm:grid-cols-3">{data.packages.map(product => <Card className="space-y-3 p-5" key={product.code}>
        <h2 className="text-xl font-semibold capitalize">{product.code}</h2><p>{money(product.amount_minor)} · {product.credits} credits · {product.valid_days} days</p>
        <Button disabled={busy || !["owner", "agent", "developer"].includes(data.role)} onClick={() => void run({ action: "checkout", product: product.code, key: crypto.randomUUID() })}>Simulate {product.code} purchase</Button>
      </Card>)}</div>
      <h2 className="text-xl font-semibold">Simulated capacity</h2>
      {data.lots.length ? data.lots.map(lot => <p key={lot.id}>{lot.remaining - lot.reserved} available · {lot.reserved} reserved</p>) : <p>No credits yet.</p>}
      <h2 className="text-xl font-semibold">Payment history</h2>
      {data.orders.map(order => <Card className="space-y-3 p-5" key={order.id}>
        <h3>{order.product} · {money(order.amount_minor)} · {order.status}</h3>
        <div className="flex flex-wrap gap-3">{(order.status === "pending" ? ["success", "failed", "cancelled"] : order.status === "success" ? ["refund", "reversal"] : []).map(outcome => <Button key={outcome} disabled={busy} onClick={() => void run({ action: "callback", order_id: order.id, outcome, key: crypto.randomUUID() })}>Simulate {outcome}</Button>)}</div>
      </Card>)}
      <h2 className="text-xl font-semibold">Premium simulations</h2>
      {data.listings.filter(listing => listing.participant_id === data.member_id && listing.state === "published").map(listing => <Card className="space-y-3 p-5" key={listing.id}>
        <Link className="underline" href={`/properties/${listing.property__slug}`}>{listing.title}</Link>
        <div className="flex flex-wrap gap-3">{data.premium.map(product => <Button key={product.code} disabled={busy} onClick={() => void run({ action: "checkout", product: product.code, listing_id: listing.id, key: crypto.randomUUID() })}>Simulate {product.days}-day premium · {money(product.amount_minor)}</Button>)}</div>
      </Card>)}
    </>}
  </section>;
}
