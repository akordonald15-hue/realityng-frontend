import { beforeEach, expect, it, vi } from "vitest";
const client = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("./client", () => ({ apiClient: client }));
vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
import { answerAssistant, sendMessage, getAssistantResponseMode } from "./assistant";
beforeEach(() => {
  client.post.mockResolvedValue({ data: {} });
});
it("marks authenticated answers knowledge-only to prevent provider fallback", async () => {
  await sendMessage({ conversationId: "owned", content: "inspection" });
  expect(client.post).toHaveBeenCalledWith("/conversations/owned/messages/", {
    content: "inspection",
    knowledge_only: true,
    demo_only: false,
  });
});
it("uses the stateless shared endpoint for public guidance", async () => {
  await answerAssistant("inspection");
  expect(client.post).toHaveBeenCalledWith("/assistant/answer/", {
    query: "inspection",
    knowledge_only: true,
  });
});

for (const enabled of [false, true])
  for (const provider_mode of ["disabled", "demo", "anthropic"] as const)
    for (const knowledge_enabled of [false, true])
      for (const demo_enabled of [false, true]) {
        it(`selects an explicit response capability ${enabled}/${provider_mode}/${knowledge_enabled}/${demo_enabled}`, () => {
          const actual = getAssistantResponseMode({
            enabled,
            provider_mode,
            knowledge_enabled,
            demo_enabled,
            label: "test",
            supported_topics: [],
            suggested_prompts: [],
          });
          const expected =
            !enabled || provider_mode === "disabled"
              ? null
              : knowledge_enabled
                ? "knowledge"
                : demo_enabled && provider_mode === "demo"
                  ? "demo"
                  : null;
          expect(actual).toBe(expected);
        });
      }
it("sends explicit demo-only authenticated requests without downgrading knowledge-only calls", async () => {
  await sendMessage({ conversationId: "owned", content: "Hello", mode: "demo" });
  expect(client.post).toHaveBeenCalledWith("/conversations/owned/messages/", {
    content: "Hello",
    knowledge_only: false,
    demo_only: true,
  });
});
it("uses the explicit stateless demo route without knowledge activation", async () => {
  await answerAssistant("Hello", "demo");
  expect(client.post).toHaveBeenCalledWith("/assistant/demo/", {
    query: "Hello",
    knowledge_only: false,
  });
});
it("never retries a failed knowledge request through demo or a paid fallback", async () => {
  client.post.mockRejectedValueOnce(new Error("disabled"));
  await expect(answerAssistant("Hello", "knowledge")).rejects.toThrow("disabled");
  expect(client.post).toHaveBeenCalledTimes(1);
  expect(client.post).toHaveBeenCalledWith("/assistant/answer/", {
    query: "Hello",
    knowledge_only: true,
  });
});
