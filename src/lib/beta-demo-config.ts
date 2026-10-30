import { notFound } from "next/navigation";

export function requireBetaDemoPage() {
  const api = process.env.NEXT_PUBLIC_API_BASE_URL;
  const expectedOrigin = process.env.MANAGEMENT_DEMO_API_ORIGIN;
  if (process.env.MANAGEMENT_DEMO_UI_ENABLED !== "true" || !api || !expectedOrigin) notFound();
  let origin: URL;
  try { origin = new URL(api); } catch { notFound(); }
  if (origin.origin !== expectedOrigin) notFound();
  if (["api.realityng.com", "realityng.com", "www.realityng.com"].includes(origin.hostname) && process.env.MANAGEMENT_DEMO_ALLOW_BETA_ORIGIN !== "true") notFound();
  if (origin.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(origin.hostname)) notFound();
}
