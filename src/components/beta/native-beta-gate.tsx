"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { betaCommand, getBetaPayments } from "@/lib/api/beta-listing-payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NativeBetaGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const enabled = Boolean(user?.is_beta_test_account && user.beta_native_enabled);
  const status = useQuery({ queryKey: ["beta-listing-payments", user?.id], queryFn: getBetaPayments, enabled });
  if (!enabled) return <>{children}</>;
  if (status.isPending) return <p role="status" className="p-6">Checking beta access…</p>;
  if (status.isError) return <p role="alert" className="p-6">Beta access is disabled, expired or unavailable. Contact the CTO.</p>;
  if (!status.data.require_password_change) return <>{children}</>;
  return <main className="mx-auto max-w-lg space-y-5 p-6">
    <h1 className="text-2xl font-semibold">Change your temporary password</h1>
    <p>Choose a unique password before opening your RealityNG workspace.</p>
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        const data = await betaCommand({ action: "change-password", current_password: current, new_password: next });
        cache.setQueryData(["beta-listing-payments", user?.id], data); setCurrent(""); setNext("");
      } catch { setError("Check your current password and choose a different strong password."); }
      finally { setBusy(false); }
    }}>
      <label className="block">Current password<Input type="password" autoComplete="current-password" required value={current} onChange={event => setCurrent(event.target.value)} /></label>
      <label className="block">New password<Input type="password" autoComplete="new-password" required minLength={8} value={next} onChange={event => setNext(event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>Change password</Button>
    </form>
  </main>;
}
