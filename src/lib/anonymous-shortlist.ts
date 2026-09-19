import { isAxiosError } from "axios";

import { createFavorite } from "@/lib/api/properties";

export const ANONYMOUS_SHORTLIST_KEY = "realityng.anonymous-shortlist.v1";
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ITEMS = 50;

type Item = { property_id: string; saved_at: string };
type Shortlist = { version: 1; updated_at: string; items: Item[] };
export type MergeResult = { added: number; alreadySaved: number; unavailable: number; pending: number };

function available() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function write(items: Item[]) {
  if (!available()) return;
  const value: Shortlist = { version: 1, updated_at: new Date().toISOString(), items };
  try {
    window.localStorage.setItem(ANONYMOUS_SHORTLIST_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event("realityng:shortlist-change"));
  } catch {
    // A blocked or full browser store must not break property browsing.
  }
}

export function readAnonymousShortlist(): Item[] {
  if (!available()) return [];
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(ANONYMOUS_SHORTLIST_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || (parsed as Shortlist).version !== 1 || !Array.isArray((parsed as Shortlist).items)) {
      write([]);
      return [];
    }
    const now = Date.now();
    const seen = new Set<string>();
    const items = (parsed as Shortlist).items.filter((item): item is Item => {
      if (!item || typeof item.property_id !== "string" || !item.property_id || typeof item.saved_at !== "string") return false;
      const saved = Date.parse(item.saved_at);
      if (!Number.isFinite(saved) || saved > now || now - saved >= RETENTION_MS || seen.has(item.property_id)) return false;
      seen.add(item.property_id);
      return true;
    }).sort((a, b) => Date.parse(a.saved_at) - Date.parse(b.saved_at)).slice(-MAX_ITEMS);
    if (items.length !== (parsed as Shortlist).items.length) write(items);
    return items;
  } catch {
    write([]);
    return [];
  }
}

export function isAnonymousSaved(propertyId: string) {
  return readAnonymousShortlist().some((item) => item.property_id === propertyId);
}

export function toggleAnonymousSave(propertyId: string) {
  const items = readAnonymousShortlist();
  const saved = items.some((item) => item.property_id === propertyId);
  write(saved ? items.filter((item) => item.property_id !== propertyId) : [...items, { property_id: propertyId, saved_at: new Date().toISOString() }].slice(-MAX_ITEMS));
  return !saved;
}

function favoriteErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data as { property_id?: { code?: string } } | undefined;
  return data?.property_id?.code;
}

let activeMerge: Promise<MergeResult> | null = null;

async function performMerge(): Promise<MergeResult> {
  const result: MergeResult = { added: 0, alreadySaved: 0, unavailable: 0, pending: 0 };
  for (const item of readAnonymousShortlist()) {
    try {
      await createFavorite(item.property_id);
      result.added++;
    } catch (error) {
      const code = favoriteErrorCode(error);
      if (code === "already_saved") result.alreadySaved++;
      else if (code === "property_unavailable") result.unavailable++;
      else { result.pending++; continue; }
    }
    // Remove only the item just processed; retain any newer saves or failed items.
    write(readAnonymousShortlist().filter((current) => current.property_id !== item.property_id));
  }
  return result;
}

export function mergeAnonymousShortlist(): Promise<MergeResult> {
  if (activeMerge) return activeMerge;
  activeMerge = performMerge().finally(() => { activeMerge = null; });
  return activeMerge;
}
