"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

type Command = Record<string, string>;
type Product = { code: string; amount_minor: number; credits?: number; valid_days?: number; days?: number };
type Listing = { id: string; title: string; state: string; expires_at: string | null; premium_until: string | null; needs_review: boolean };
type Order = { id: string; product: string; amount_minor: number; status: string };
type Dashboard = {
  notice: string; policy: string; role: string; packages: Product[]; premium: Product[];
  listings: Listing[]; orders: Order[]; lots: { id: number; remaining: number; reserved: number; expires_at: string }[];
};
const button = "rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);

export function ManagementDemo() {
  const { isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("Synthetic management listing");
  const [retry, setRetry] = useState<Command | null>(null);
  const callbacks = useRef<Record<string, Command>>({});
  const load = useCallback(async () => {
    try { setData((await apiClient.get<Dashboard>("/management-demo/")).data); setError(""); }
    catch { setData(null); setError("Demo access unavailable. Use an approved synthetic account on the separate demo environment."); }
  }, []);
  useEffect(() => { if (isAuthenticated) void load(); else setData(null); }, [isAuthenticated, load]);
  async function execute(command: Command) {
    setBusy(true); setError(""); setRetry(null);
    try { setData((await apiClient.post<Dashboard>("/management-demo/", command)).data); }
    catch { setError("The demo action was rejected or its result is uncertain. Refresh to inspect state before retrying the same action."); setRetry(command); }
    finally { setBusy(false); }
  }
  const purchase = (product: string, listing_id?: string) => execute({ action: "checkout", product, key: crypto.randomUUID(), ...(listing_id ? { listing_id } : {}) });
  function simulate(order: Order, outcome: string) {
    const command = { action: "callback", order_id: order.id, outcome, key: crypto.randomUUID() };
    callbacks.current[order.id] = command;
    void execute(command);
  }
  const publisher = data && ["owner", "agent", "developer"].includes(data.role);
  if (isLoading) return <p role="status">Loading demo session…</p>;
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 text-emerald-950">
    <aside className="sticky top-0 z-20 rounded-lg border border-amber-300 bg-amber-100 px-4 py-3 font-bold text-amber-950">DEMO PAYMENT — NO MONEY CHARGED</aside>
    <header className="rounded-2xl bg-emerald-950 p-6 text-white">
      <h1 className="text-2xl font-semibold">RealityNG management demo</h1>
      <p className="mt-2 text-sm">Proposed commercial policy. Synthetic ledger only. No Paystack calls, real credits, paid publication or search promotion.</p>
    </header>
    {error && <p role="alert" className="rounded-lg border border-red-300 p-4">{error}</p>}
    {!isAuthenticated ? <form className="max-w-md space-y-4" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError("");
      try { await signIn({ email, password }, null); setPassword(""); } catch { setError("Sign-in failed. Check your approved demo credentials."); } finally { setBusy(false); }
    }}>
      <label className="block">Demo email<input className="mt-1 block w-full rounded border p-3" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label className="block">Temporary password<input className="mt-1 block w-full rounded border p-3" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
      <button className={button} disabled={busy}>Sign in to isolated demo</button>
    </form> : <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => void load()}>Refresh demo</button><button className={button} disabled={busy} onClick={() => { callbacks.current = {}; setData(null); setRetry(null); void signOut(); }}>Sign out</button></div>}
    {retry && <button className={button} disabled={busy} onClick={() => void execute(retry)}>Retry same request</button>}
    {busy && <p role="status">Processing simulation…</p>}
    {data && <>
      <p>Demo role: <strong>{data.role}</strong>. {data.policy}</p>
      {publisher && <section aria-label="Proposed listing packages" className="grid gap-4 sm:grid-cols-3">{data.packages.map(product => <article className="rounded-xl border border-emerald-200 p-4" key={product.code}>
        <h2 className="font-semibold capitalize">{product.code}</h2><p>{money(product.amount_minor)} · {product.credits} credits · {product.valid_days} days</p>
        <button className={`${button} mt-3`} disabled={busy} onClick={() => void purchase(product.code)}>Simulate {product.code} checkout</button>
      </article>)}</section>}
      <section aria-label="Demo credit inventory"><h2 className="text-xl font-semibold">Simulated credits</h2>{data.lots.length ? data.lots.map(lot => <p key={lot.id}>{lot.remaining - lot.reserved} available · {lot.reserved} reserved · expires {new Date(lot.expires_at).toLocaleDateString()}</p>) : <p>No simulated capacity allocated.</p>}</section>
      <section aria-label="Demo payment orders" className="space-y-3"><h2 className="text-xl font-semibold">Mock checkout and verification</h2>{data.orders.map(order => <article className="rounded-xl border p-4" key={order.id}><h3>{order.product} · {money(order.amount_minor)} · {order.status}</h3><p className="text-sm">DEMO PAYMENT — NO MONEY CHARGED</p><div className="mt-3 flex flex-wrap gap-2">
        {(order.status === "pending" ? ["success", "failed", "cancelled"] : order.status === "success" ? ["refund", "reversal"] : []).map(outcome => <button key={outcome} className={button} disabled={busy} onClick={() => simulate(order, outcome)}>Simulate {outcome}</button>)}
        {callbacks.current[order.id] && <button className={button} disabled={busy} onClick={() => void execute(callbacks.current[order.id])}>Repeat identical callback</button>}
      </div></article>)}</section>
      {publisher && <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); void execute({ action: "create-listing", title }); }}><label>Synthetic listing title<input className="block rounded border p-3" required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} /></label><button className={button} disabled={busy}>Create demo draft</button></form>}
      <section aria-label="Simulated listings" className="space-y-3"><h2 className="text-xl font-semibold">Publication and premium simulation</h2><p>Approval consumes one reserved credit. Publication lasts 90 days. These are separate demo listings, not public search results.</p>{data.listings.map(listing => <article className="space-y-3 rounded-xl border p-4" key={listing.id}><h3 className="font-semibold">{listing.title} · {listing.state}</h3>{listing.needs_review && <p role="status">Simulated reversal requires manual review.</p>}<p>Expiry: {listing.expires_at ? new Date(listing.expires_at).toLocaleDateString() : "Not published"} · Premium until: {listing.premium_until ? new Date(listing.premium_until).toLocaleString() : "Inactive"}</p><div className="flex flex-wrap gap-2">
        {(data.role === "admin" && listing.state === "review" ? ["approve", "reject"] : publisher && listing.state === "draft" ? ["submit"] : publisher && listing.state === "expired" ? ["renew"] : publisher && listing.state === "review" ? ["reject"] : publisher && listing.state === "published" ? ["expire", "expire-premium"] : []).map(action => <button key={action} className={button} disabled={busy} onClick={() => void execute({ action, listing_id: listing.id })}>{action}</button>)}
        {publisher && listing.state === "published" && data.premium.map(product => <button key={product.code} className={button} disabled={busy} onClick={() => void purchase(product.code, listing.id)}>Simulate {product.days}-day premium · {money(product.amount_minor)}</button>)}
      </div></article>)}</section>
    </>}
  </main>;
}
