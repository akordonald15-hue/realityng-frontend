import { beforeEach, expect, it, vi } from "vitest";
const client = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("./client", () => ({ apiClient: client }));
vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
import { answerAssistant, sendMessage } from "./assistant";
beforeEach(() => {
  client.post.mockResolvedValue({ data: {} });
});
it("marks authenticated answers knowledge-only to prevent provider fallback", async () => {
  await sendMessage({ conversationId: "owned", content: "inspection" });
  expect(client.post).toHaveBeenCalledWith("/conversations/owned/messages/", {
    content: "inspection",
    knowledge_only: true,
  });
});
it("uses the stateless shared endpoint for public guidance", async () => {
  await answerAssistant("inspection");
  expect(client.post).toHaveBeenCalledWith("/assistant/answer/", { query: "inspection" });
});
