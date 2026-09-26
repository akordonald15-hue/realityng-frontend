import { describe, expect, it } from "vitest";

import { beforeBreadcrumb, beforeSend } from "./sentry-privacy";

describe("Sentry privacy controls", () => {
  it("removes request bodies and scrubs secrets and direct user identifiers", () => {
    const event = beforeSend(
      {
        type: undefined,
        request: {
          url: "https://api.example.test/path?reset_token=secret&safe=value",
          data: { document: "private" },
          cookies: { session: "secret" },
          headers: { Authorization: "Bearer secret", Accept: "application/json" },
        },
        extra: { password: "secret", nested: { googleCredential: "secret" } },
        user: { id: "safe-id", email: "private@example.test", ip_address: "127.0.0.1" },
      },
      {},
    );

    expect(event.request?.data).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
    expect(event.request?.headers?.Authorization).toBe("[Filtered]");
    expect(event.request?.url).toContain("reset_token=%5BFiltered%5D");
    expect(event.extra?.password).toBe("[Filtered]");
    expect(event.extra?.nested).toEqual({ googleCredential: "[Filtered]" });
    expect(event.user).toEqual({ id: "safe-id" });
  });

  it("drops console breadcrumbs and scrubs signed URLs", () => {
    expect(beforeBreadcrumb({ category: "console", message: "private" })).toBeNull();
    const breadcrumb = beforeBreadcrumb({
      category: "http",
      data: { url: "https://storage.test/private.pdf?X-Amz-Signature=secret" },
    });
    expect(breadcrumb?.data?.url).toContain("X-Amz-Signature=%5BFiltered%5D");
  });
});
