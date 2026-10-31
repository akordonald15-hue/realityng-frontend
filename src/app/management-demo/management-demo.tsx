"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { getRoleDashboardPath } from "@/lib/auth/permissions";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

type Command = Record<string, string>;
type Product = { code: string; amount_minor: number; credits?: number; valid_days?: number; days?: number };
type Listing = { id: string; title: string; state: string; expires_at: string | null; premium_until: string | null; needs_review: boolean; participant_id?: number; assigned_agent_id?: number | null };
type Order = { id: string; product: string; amount_minor: number; status: string };
type Dashboard = {
  notice: string; policy: string; role: string; packages: Product[]; premium: Product[];
  listings: Listing[]; orders: Order[]; lots: { id: number; remaining: number; reserved: number; expires_at: string }[];
  member_id?: number; require_password_change?: boolean;
  agents?: { id: number; user__first_name: string }[];
  threads?: { id: string; demo_binding__listing__title: string }[];
  professional_profile?: { business_name: string; status: string } | null;
};
const button = "rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);

export function ManagementDemo() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  useEffect(() => {
    if (user?.is_beta_test_account && user.beta_native_enabled) {
      window.location.replace(getRoleDashboardPath(user));
    }
  }, [user]);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("Synthetic management listing");
  const [retry, setRetry] = useState<Command | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Record<string, string>>({});
  const [listingTitles, setListingTitles] = useState<Record<string, string>>({});
  const generation = useRef(0);
  const callbacks = useRef<Record<string, Command>>({});
  const load = useCallback(async () => {
    const active = generation.current;
    try { const response = await apiClient.get<Dashboard>("/management-demo/"); if (active !== generation.current) return; setData(response.data); setError(""); }
    catch { if (active !== generation.current) return; setData(null); setError("Beta demo is disabled, expired or unavailable to this account. Use your approved synthetic beta account."); }
  }, []);
  useEffect(() => { generation.current += 1; setData(null); setRetry(null); callbacks.current = {}; setCurrentPassword(""); setNewPassword(""); if (isAuthenticated) void load(); return () => { generation.current += 1; }; }, [isAuthenticated, user?.id, load]);
  async function execute(command: Command) {
    setBusy(true); setError(""); setRetry(null);
    const active = generation.current;
    try { const response = await apiClient.post<Dashboard>("/management-demo/", command); if (active === generation.current) setData(response.data); return true; }
    catch (reason) {
      if (active !== generation.current) return false;
      if ((reason as { response?: { status?: number } }).response?.status === 403) { setData(null); setError("Beta demo is disabled or your access was revoked."); return false; }
      setError(command.action === "change-password" ? "Password change failed. Check your current password and choose a different strong password." : "The demo action was rejected or its result is uncertain. Refresh to inspect state before retrying the same action.");
      if (command.action !== "change-password") setRetry(command);
      return false;
    }
    finally { setBusy(false); }
  }
  const purchase = (product: string, listing_id?: string) => execute({ action: "checkout", product, key: crypto.randomUUID(), ...(listing_id ? { listing_id } : {}) });
  function simulate(order: Order, outcome: string) {
    const command = { action: "callback", order_id: order.id, outcome, key: crypto.randomUUID() };
    callbacks.current[order.id] = command;
    void execute(command);
  }
  const publisher = data && ["owner", "agent", "developer"].includes(data.role);
  if (user?.is_beta_test_account && user.beta_native_enabled) return <p role="status">Opening your RealityNG workspace…</p>;
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
      <button className={button} disabled={busy}>Sign in to beta demo</button>
    </form> : <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => void load()}>Refresh demo</button><button className={button} disabled={busy} onClick={() => { generation.current += 1; callbacks.current = {}; setData(null); setRetry(null); void signOut(); }}>Sign out</button></div>}
    {retry && <button className={button} disabled={busy} onClick={() => void execute(retry)}>Retry same request</button>}
    {busy && <p role="status">Processing simulation…</p>}
    {data?.require_password_change && <form className="max-w-md space-y-4" onSubmit={async event => { event.preventDefault(); const success = await execute({ action: "change-password", current_password: currentPassword, new_password: newPassword }); if (success) { setCurrentPassword(""); setNewPassword(""); } }}>
      <h2 className="text-xl font-semibold">Change your temporary beta password</h2>
      <p>Choose a unique password before using the demo. Your account cannot access production customer records.</p>
      <label className="block">Current password<input className="block w-full rounded border p-3" type="password" autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label>
      <label className="block">New password<input className="block w-full rounded border p-3" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>
      <button className={button} disabled={busy}>Change beta password</button>
    </form>}
    {data && !data.require_password_change && <>
      <p>Demo role: <strong>{data.role}</strong>. {data.policy}</p>
      {data.role === "admin" && <p className="rounded border p-3">Demo moderation only. This account has no production administrator privileges.</p>}
      {data.role === "artisan" && <form className="space-y-3 rounded-xl border p-4" onSubmit={event => { event.preventDefault(); void execute({ action: "professional-profile", business_name: businessName || data.professional_profile?.business_name || "Synthetic beta artisan" }); }}><h2 className="text-xl font-semibold">Artisan workspace</h2><p>Artisan role and professional verification are separate. Provider status: {data.professional_profile?.status ?? "draft"}. No BVN/NIN checks are active.</p><label className="block">Synthetic business name<input className="block rounded border p-3" maxLength={120} required value={businessName || data.professional_profile?.business_name || "Synthetic beta artisan"} onChange={event => setBusinessName(event.target.value)} /></label><button className={button} disabled={busy}>Save synthetic professional profile</button></form>}
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
      <section aria-label="Simulated listings" className="space-y-3">
        <h2 className="text-xl font-semibold">Private beta listings and moderation</h2>
        <p>Approval consumes one simulated reserved credit. Publication lasts 90 days within the demo only; no public search listing or genuine capacity is issued.</p>
        {data.listings.map(listing => {
          const own = data.member_id !== undefined && listing.participant_id === data.member_id;
          const delegated = data.member_id !== undefined && listing.assigned_agent_id === data.member_id;
          const agents = (data.agents ?? []).filter(agent => agent.id !== data.member_id);
          const agentId = selectedAgents[listing.id] ?? String(agents[0]?.id ?? "");
          const editable = (own || delegated) && ["draft", "expired"].includes(listing.state);
          const actions = data.role === "admin" && listing.state === "review" ? ["approve", "reject"] : (own || delegated) && listing.state === "draft" ? ["submit"] : (own || delegated) && listing.state === "expired" ? ["renew"] : own && listing.state === "review" ? ["reject"] : own && listing.state === "published" ? ["expire", "expire-premium"] : [];
          return <article className="space-y-3 rounded-xl border p-4" key={listing.id}>
            <h3 className="font-semibold">{listing.title} · {listing.state}</h3>
            {delegated && <p>Assigned agent access. Capacity belongs to the synthetic owner.</p>}
            {listing.needs_review && <p role="status">Simulated reversal requires manual review.</p>}
            <p>Expiry: {listing.expires_at ? new Date(listing.expires_at).toLocaleDateString() : "Not published"} · Premium until: {listing.premium_until ? new Date(listing.premium_until).toLocaleString() : "Inactive"}</p>
            {editable && <form className="flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); void execute({ action: "edit-listing", listing_id: listing.id, title: listingTitles[listing.id] ?? listing.title }); }}><label>Demo listing title<input className="block rounded border p-3" required maxLength={120} value={listingTitles[listing.id] ?? listing.title} onChange={event => setListingTitles({ ...listingTitles, [listing.id]: event.target.value })} /></label><button className={button} disabled={busy}>Save demo listing</button></form>}
            {own && agents.length > 0 && <div className="flex flex-wrap items-end gap-2"><label>Assign synthetic agent<select className="block rounded border p-3" value={agentId} onChange={event => setSelectedAgents({ ...selectedAgents, [listing.id]: event.target.value })}>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.user__first_name || "Synthetic"} agent #{agent.id}</option>)}</select></label><button className={button} disabled={busy || !agentId} onClick={() => void execute({ action: "assign-agent", listing_id: listing.id, agent_id: agentId })}>Assign agent</button>{listing.assigned_agent_id && <button className={button} disabled={busy} onClick={() => void execute({ action: "revoke-agent", listing_id: listing.id })}>Revoke agent</button>}</div>}
            <div className="flex flex-wrap gap-2">
              {actions.map(action => <button key={action} className={button} disabled={busy} onClick={() => void execute({ action, listing_id: listing.id })}>{action}</button>)}
              {own && listing.state === "published" && data.premium.map(product => <button key={product.code} className={button} disabled={busy || Boolean(listing.premium_until && new Date(listing.premium_until).getTime() > Date.now())} onClick={() => void purchase(product.code, listing.id)}>Simulate {product.days}-day premium · {money(product.amount_minor)}</button>)}
              {["customer", "artisan"].includes(data.role) && listing.state === "published" && <><button className={button} disabled={busy} onClick={() => void execute({ action: "start-conversation", listing_id: listing.id, target: "owner" })}>Message synthetic owner</button>{listing.assigned_agent_id && <button className={button} disabled={busy} onClick={() => void execute({ action: "start-conversation", listing_id: listing.id, target: "agent" })}>Message synthetic agent</button>}</>}
            </div>
          </article>;
        })}
      </section>
      <section aria-label="Private beta conversations" className="space-y-3"><h2 className="text-xl font-semibold">Real-time synthetic conversations</h2>{(data.threads ?? []).length ? data.threads?.map(thread => <Link className="block rounded-lg border p-4 underline" key={thread.id} href={`/management-demo/messages/${thread.id}`}>{thread.demo_binding__listing__title} — open conversation</Link>) : <p>No authorized private beta conversations yet.</p>}</section>
      <p className="text-sm">Real Paystack, paid-publication enforcement, premium search promotion, BVN/NIN and new service-conversation creation remain disabled.</p>
    </>}
  </main>;
}
