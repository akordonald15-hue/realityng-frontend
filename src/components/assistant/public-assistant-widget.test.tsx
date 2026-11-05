import { ASSISTANT_WELCOME, ASSISTANT_UNSUPPORTED } from "./assistant-copy";
const LEGACY_UNSUPPORTED =
  "I am currently a guided demo assistant. I can help with property search guidance, viewing requests, rental applications, verification, support, and approved app navigation. I cannot answer unsupported questions or fabricate private, legal, pricing, or listing details.";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicAssistantWidget } from "./public-assistant-widget";

const api = vi.hoisted(() => ({ getAssistantConfig: vi.fn(), answerAssistant: vi.fn() }));
vi.mock("@/lib/api/assistant", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/assistant")>()),
  ...api,
}));
vi.mock("@/providers/auth-provider", () => ({ useOptionalAuth: () => null }));
const response = {
  intent: "search",
  content: "Approved search guidance",
  status: "enabled",
  sources: [{ id: "search", title: "Find properties", version: "2026-11-04.1" }],
  links: [{ label: "Browse", path: "/properties" }],
  knowledge_version: "2026-11-04.1",
};
function viewport(width: number) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({ matches: width >= 640 })),
  });
}
async function open() {
  await act(async () => {
    vi.advanceTimersByTime(1500);
  });
  fireEvent.click(screen.getByRole("button", { name: "Open RealityNG AI" }));
}
function submit() {
  fireEvent.change(screen.getByLabelText("Ask RealityNG AI"), { target: { value: "search" } });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
}
describe("Shared public assistant", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    viewport(1440);
    api.getAssistantConfig.mockResolvedValue({
      enabled: true,
      knowledge_enabled: true,
      suggested_prompts: ["Walk me through RealityNG"],
    });
    api.answerAssistant.mockResolvedValue(response);
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });
  it("shows the approved header, welcome and placeholder without internal terminology", async () => {
    render(<PublicAssistantWidget />);
    await open();
    expect(screen.getByRole("heading", { name: "RealityNG AI" })).toBeInTheDocument();
    expect(screen.getByText("Your RealityNG property assistant")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask me about RealityNG...")).toBeInTheDocument();
    expect(screen.getByText(/Hi! Welcome to RealityNG/).textContent).toBe(ASSISTANT_WELCOME);
    expect(screen.queryByText(/guided demo|live model|synthesis/i)).not.toBeInTheDocument();
  });
  it("presents an unsupported reply helpfully without mutating the API response", async () => {
    const payload = { ...response, intent: "unsupported", content: LEGACY_UNSUPPORTED };
    api.answerAssistant.mockResolvedValue(payload);
    render(<PublicAssistantWidget />);
    await open();
    await act(async () => {
      submit();
    });
    expect(screen.getByText(ASSISTANT_UNSUPPORTED)).toBeInTheDocument();
    expect(payload.content).toBe(LEGACY_UNSUPPORTED);
  });
  it("uses the shared service and renders grounding without verified-property promises", async () => {
    render(<PublicAssistantWidget />);
    await open();
    expect(screen.queryByText(/find verified properties/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Walk me through RealityNG" })).toBeInTheDocument();
    await act(async () => {
      submit();
    });
    expect(api.answerAssistant).toHaveBeenCalledWith("search", "knowledge");
    expect(screen.getByText(response.content)).toBeInTheDocument();
    expect(screen.getByText(/Source: Find properties/)).toBeInTheDocument();
  });
  it("does not auto-expand the mobile greeting and preserves keyboard focus", async () => {
    viewport(390);
    render(<PublicAssistantWidget />);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByText(/Welcome to RealityNG/)).not.toBeInTheDocument();
    await open();
    expect(screen.getByLabelText("Ask RealityNG AI")).toHaveFocus();
    fireEvent.keyDown(screen.getByLabelText("Ask RealityNG AI"), { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole("button", { name: "Open RealityNG AI" })).toHaveFocus();
  });
  it("fails closed on disabled or older backend config", async () => {
    api.getAssistantConfig.mockResolvedValue({ enabled: true });
    render(<PublicAssistantWidget />);
    await open();
    submit();
    expect(api.answerAssistant).not.toHaveBeenCalled();
    expect(screen.getByText(/Approved guidance is currently unavailable/)).toBeInTheDocument();
  });
  it("shows a safe fallback on service failure", async () => {
    api.answerAssistant.mockRejectedValue(new Error("unavailable"));
    render(<PublicAssistantWidget />);
    await open();
    await act(async () => {
      submit();
    });
    expect(screen.getByText(/Approved guidance is currently unavailable/)).toBeInTheDocument();
  });
  it("ignores late replies after closing and prevents duplicate submits", async () => {
    let finish!: (answer: typeof response) => void;
    api.answerAssistant.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<PublicAssistantWidget />);
    await open();
    submit();
    fireEvent.submit(screen.getByLabelText("Ask RealityNG AI").closest("form")!);
    expect(api.answerAssistant).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close RealityNG AI" }));
    await act(async () => {
      finish(response);
    });
    await open();
    expect(screen.queryByText(response.content)).not.toBeInTheDocument();
  });
  it("does not echo inputs flagged as sensitive", async () => {
    api.answerAssistant.mockResolvedValue({
      ...response,
      intent: "privacy",
      content: "Do not share secrets",
    });
    render(<PublicAssistantWidget />);
    await open();
    await act(async () => {
      submit();
    });
    expect(screen.getByText("Do not share secrets")).toBeInTheDocument();
    expect(screen.queryByText("search")).not.toBeInTheDocument();
  });
  it("preserves public demo replies with knowledge disabled", async () => {
    api.getAssistantConfig.mockResolvedValue({
      enabled: true,
      provider_mode: "demo",
      demo_enabled: true,
      knowledge_enabled: false,
      suggested_prompts: [],
    });
    api.answerAssistant.mockResolvedValue({
      ...response,
      status: "demo",
      sources: [],
      knowledge_version: null,
      content: "Existing guided demo reply",
    });
    render(<PublicAssistantWidget />);
    await open();
    await act(async () => {
      submit();
    });
    expect(api.answerAssistant).toHaveBeenCalledWith("search", "demo");
    expect(screen.getByText("Existing guided demo reply")).toBeInTheDocument();
    expect(screen.getByText("Your RealityNG property assistant")).toBeInTheDocument();
    expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
  });
});
