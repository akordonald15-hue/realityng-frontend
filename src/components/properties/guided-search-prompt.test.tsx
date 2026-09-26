import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GuidedSearchPrompt, toSearchParams } from "@/components/properties/guided-search-prompt";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchWithAssistant: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/properties",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/assistant", () => ({
  searchWithAssistant: mocks.searchWithAssistant,
}));

function renderPrompt() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <GuidedSearchPrompt />
    </QueryClientProvider>,
  );
}

function result(extracted: Record<string, unknown>) {
  return { query: "q", extracted_filters: extracted, result_count: 0, results: [] };
}

describe("toSearchParams", () => {
  it("maps every supported parser field onto marketplace query parameters", () => {
    const params = toSearchParams({
      city: "Lekki",
      property_type: "apartment",
      listing_type: "rent",
      min_price: 1000000,
      max_price: 5000000,
      min_bedrooms: 2,
      min_bathrooms: 1,
    });

    expect(Object.fromEntries(params)).toEqual({
      city: "Lekki",
      property_type: "apartment",
      listing_type: "rent",
      min_price: "1000000",
      max_price: "5000000",
      min_bedrooms: "2",
      min_bathrooms: "1",
    });
  });

  it("ignores unknown keys and empty values so nothing unexpected reaches the URL", () => {
    const params = toSearchParams({
      city: "Abuja",
      // not a marketplace filter - must never be forwarded
      landlord_email: "someone@example.test",
      max_price: "",
      min_bedrooms: null,
    });

    expect(Object.fromEntries(params)).toEqual({ city: "Abuja" });
  });

  it("returns no parameters for a null or empty extraction", () => {
    expect([...toSearchParams(null).keys()]).toHaveLength(0);
    expect([...toSearchParams({}).keys()]).toHaveLength(0);
  });
});

describe("GuidedSearchPrompt", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.searchWithAssistant.mockReset();
  });

  it("sends the prompt and routes into the existing marketplace filters", async () => {
    mocks.searchWithAssistant.mockResolvedValue(
      result({ city: "Lekki", property_type: "apartment", max_price: 5000000 }),
    );
    const user = userEvent.setup();
    renderPrompt();

    await user.type(
      screen.getByRole("searchbox"),
      "2 bedroom apartment in Lekki under 5 million",
    );
    await user.click(screen.getByRole("button", { name: "Find matches" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    const target = mocks.push.mock.calls[0][0] as string;
    expect(target.startsWith("/properties?")).toBe(true);
    const params = new URLSearchParams(target.split("?")[1]);
    expect(params.get("city")).toBe("Lekki");
    expect(params.get("property_type")).toBe("apartment");
    expect(params.get("max_price")).toBe("5000000");
  });

  it("explains itself instead of navigating when nothing could be understood", async () => {
    mocks.searchWithAssistant.mockResolvedValue(result({}));
    const user = userEvent.setup();
    renderPrompt();

    await user.type(screen.getByRole("searchbox"), "something entirely unrelated");
    await user.click(screen.getByRole("button", { name: "Find matches" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/could not turn that into filters/i);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("surfaces a readable message when the parser is unavailable", async () => {
    mocks.searchWithAssistant.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    renderPrompt();

    await user.type(screen.getByRole("searchbox"), "3 bedroom house in Abuja");
    await user.click(screen.getByRole("button", { name: "Find matches" }));

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("does not search an empty prompt", async () => {
    const user = userEvent.setup();
    renderPrompt();

    expect(screen.getByRole("button", { name: "Find matches" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Find matches" }));
    expect(mocks.searchWithAssistant).not.toHaveBeenCalled();
  });

  it("fills the prompt from an example", async () => {
    const user = userEvent.setup();
    renderPrompt();

    await user.click(screen.getByRole("button", { name: "3 bedroom house in Abuja for sale" }));
    expect(screen.getByRole("searchbox")).toHaveValue("3 bedroom house in Abuja for sale");
  });
});
