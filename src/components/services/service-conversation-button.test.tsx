import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServiceConversationButton } from "./service-conversation-button";
import { renderWithQueryClient } from "@/test/render";
const mocks = vi.hoisted(() => ({ create: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/lib/api/messages", () => ({ createThread: mocks.create }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("Service conversation entry", () => {
  it("stays hidden until explicitly enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_SERVICE_CONVERSATIONS_ENABLED", "false");
    renderWithQueryClient(<ServiceConversationButton quoteId="quote-1" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("uses the quote context and opens the server-derived conversation", async () => {
    vi.stubEnv("NEXT_PUBLIC_SERVICE_CONVERSATIONS_ENABLED", "true");
    mocks.create
      .mockRejectedValueOnce(new Error("Unavailable"))
      .mockResolvedValueOnce({ id: "thread-1" });
    renderWithQueryClient(<ServiceConversationButton quoteId="quote-1" />);
    await userEvent.click(screen.getByRole("button"));
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/dashboard/messages/thread-1"));
    expect(mocks.create).toHaveBeenLastCalledWith({ service_quote: "quote-1" });
  });
});
