import { beforeEach, describe, expect, it, vi } from "vitest";

import { ANONYMOUS_SHORTLIST_KEY, isAnonymousSaved, mergeAnonymousShortlist, readAnonymousShortlist, toggleAnonymousSave } from "@/lib/anonymous-shortlist";

const mocks = vi.hoisted(() => ({ createFavorite: vi.fn() }));
vi.mock("@/lib/api/properties", () => ({ createFavorite: (id: string) => mocks.createFavorite(id) }));

function codedError(code: string) {
  return { isAxiosError: true, response: { status: 400, data: { property_id: { code } } } };
}

describe("anonymous shortlist", () => {
  beforeEach(() => {
    localStorage.removeItem(ANONYMOUS_SHORTLIST_KEY);
    mocks.createFavorite.mockReset();
    vi.useRealTimers();
  });

  it("persists only IDs, deduplicates, and can be removed", () => {
    expect(toggleAnonymousSave("one")).toBe(true);
    expect(isAnonymousSaved("one")).toBe(true);
    expect(readAnonymousShortlist()).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(ANONYMOUS_SHORTLIST_KEY)!).version).toBe(1);
    expect(Object.keys(readAnonymousShortlist()[0])).toEqual(["property_id", "saved_at"]);
    expect(toggleAnonymousSave("one")).toBe(false);
    expect(readAnonymousShortlist()).toEqual([]);
  });

  it("expires old entries, recovers malformed data, and evicts oldest over 50", () => {
    localStorage.setItem(ANONYMOUS_SHORTLIST_KEY, "{");
    expect(readAnonymousShortlist()).toEqual([]);
    localStorage.setItem(ANONYMOUS_SHORTLIST_KEY, JSON.stringify({ version: 1, items: [{ property_id: "old", saved_at: "2020-01-01T00:00:00Z" }] }));
    expect(readAnonymousShortlist()).toEqual([]);
    for (let i = 0; i < 51; i++) toggleAnonymousSave(`id-${i}`);
    expect(readAnonymousShortlist()).toHaveLength(50);
    expect(isAnonymousSaved("id-0")).toBe(false);
    expect(isAnonymousSaved("id-50")).toBe(true);
  });

  it("merges success, duplicate, and unavailable; retains transient failures", async () => {
    ["added", "duplicate", "unavailable", "retry"].forEach(toggleAnonymousSave);
    mocks.createFavorite.mockResolvedValueOnce({});
    mocks.createFavorite.mockRejectedValueOnce(codedError("already_saved"));
    mocks.createFavorite.mockRejectedValueOnce(codedError("property_unavailable"));
    mocks.createFavorite.mockRejectedValueOnce(new Error("network"));
    expect(await mergeAnonymousShortlist()).toEqual({ added: 1, alreadySaved: 1, unavailable: 1, pending: 1 });
    expect(readAnonymousShortlist().map((item) => item.property_id)).toEqual(["retry"]);
    mocks.createFavorite.mockResolvedValueOnce({});
    expect(await mergeAnonymousShortlist()).toEqual({ added: 1, alreadySaved: 0, unavailable: 0, pending: 0 });
  });
});
