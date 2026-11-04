import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const route of ["/", "/for-professionals"]) {
  test(`shared assistant fits and supports keyboard on ${route}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/v1/**", async (request) => {
      const headers = {
        "Access-Control-Allow-Origin": request.request().headers().origin ?? "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "content-type,x-request-id,authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      };
      if (request.request().method() === "OPTIONS")
        return request.fulfill({ status: 204, headers });
      const path = new URL(request.request().url()).pathname;
      const body = path.endsWith("/assistant/config/")
        ? {
            enabled: true,
            knowledge_enabled: true,
            provider_mode: "demo",
            label: "RealityNG Assistant",
            supported_topics: ["Property guidance"],
            suggested_prompts: ["How do I search?"],
          }
        : path.endsWith("/assistant/answer/")
          ? {
              intent: "search",
              content:
                "Browse properties using available filters. Approval does not guarantee verification.",
              sources: [{ id: "search", title: "Find properties", version: "2026-11-04.1" }],
              links: [{ label: "Browse properties", path: "/properties" }],
              knowledge_version: "2026-11-04.1",
              status: "enabled",
            }
          : { results: [], count: 0 };
      await request.fulfill({
        status: path.endsWith("/users/me/") ? 401 : 200,
        headers,
        json: body,
      });
    });
    await page.goto(route);
    const launcher = page.getByRole("button", { name: "Open RealityNG AI" });
    await expect(launcher).toBeVisible();
    await launcher.click();
    const input = page.getByLabel("Ask RealityNG AI");
    await expect(input).toBeFocused();
    await input.fill("How do I search?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page.getByText(/Source: Find properties/)).toBeVisible();
    const panel = page.getByRole("region", { name: "RealityNG AI assistant" });
    await panel.locator("[data-assistant-avatar] img").evaluate(image => (image as HTMLImageElement).decode());
    expect(await panel.locator("[data-assistant-avatar] img").evaluate(image => getComputedStyle(image).transitionDuration)).toBe("0s");
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({
      path: testInfo.outputPath(route === "/" ? "b2c-assistant.png" : "b2b-assistant.png"),
    });
    const accessibility = await new AxeBuilder({ page })
      .include('[aria-label="RealityNG AI assistant"]')
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await input.focus();
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(launcher).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test("authenticated assistant uses knowledge-only answers above mobile navigation", async ({
  page,
}, testInfo) => {
  const answer = {
    intent: "viewing",
    content: "Choose a property and request an inspection through its existing workflow.",
    sources: [{ id: "viewing", title: "Request an inspection", version: "2026-11-04.1" }],
    links: [{ label: "Browse properties", path: "/properties" }],
    knowledge_version: "2026-11-04.1",
    status: "enabled",
  };
  await page.addInitScript(() => {
    localStorage.setItem("realityng.accessToken", "isolated-browser-fixture");
    localStorage.setItem("realityng.refreshToken", "isolated-browser-fixture");
  });
  await page.route("**/api/v1/**", async (route) => {
    const headers = {
      "Access-Control-Allow-Origin": route.request().headers().origin ?? "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type,x-request-id,authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { results: [], count: 0 };
    if (path.endsWith("/users/me/"))
      body = {
        id: "isolated-buyer",
        email: "browser-fixture@example.test",
        first_name: "Synthetic",
        last_name: "Buyer",
        is_active: true,
        is_email_verified: true,
        is_suspended: false,
        profile: {},
        roles: [{ role: { name: "buyer" }, status: "approved" }],
      };
    if (path.endsWith("/assistant/config/"))
      body = {
        enabled: true,
        knowledge_enabled: true,
        provider_mode: "demo",
        label: "RealityNG Assistant",
        supported_topics: [],
        suggested_prompts: [],
      };
    if (path.endsWith("/conversations/"))
      body = {
        id: "owned-fixture",
        provider: "demo",
        status: "active",
        messages: [],
      };
    if (path.endsWith("/conversations/owned-fixture/messages/")) {
      expect(route.request().postDataJSON().knowledge_only).toBe(true);
      body = {
        user_message: { id: "u", role: "user", content: "inspection" },
        assistant_message: {
          id: "a",
          role: "assistant",
          content: answer.content,
          tool_results: [
            {
              tool_use_id: "knowledge",
              tool: "navigate",
              input: {},
              result: {
                target: "viewing",
                path: "/properties",
                property_id: null,
                knowledge: answer,
              },
            },
          ],
        },
      };
    }
    await route.fulfill({ status: 200, headers, json: body });
  });
  await page.goto("/saved-properties");
  await page.getByRole("button", { name: "Open RealityNG AI assistant", exact: true }).click();
  const input = page.getByLabel("Ask RealityNG assistant", { exact: true });
  await expect(input).toBeEnabled();
  await input.fill("inspection");
  await input.press("Enter");
  await expect(page.getByText(/Source: Request an inspection/)).toBeVisible();
  const panel = page.getByRole("region", { name: "RealityNG AI assistant", exact: true });
  const box = await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height - (page.viewportSize()!.width < 640 ? 64 : 0),
  );
  const scan = await new AxeBuilder({ page })
    .include('[aria-label="RealityNG AI assistant"]')
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("authenticated-assistant.png") });
  await input.focus();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open RealityNG AI assistant", exact: true }),
  ).toBeFocused();
});

for (const destination of ["/", "/for-professionals", "/saved-properties"]) {
  test(`approved demo configuration keeps replies and navigation working on ${destination}`, async ({
    page,
  }) => {
    const authenticated = destination === "/saved-properties";
    const sent: string[] = [];
    const reply =
      "You can continue in RealityNG at /dashboard. I can only suggest approved app destinations in demo mode.";
    if (authenticated)
      await page.addInitScript(() => {
        localStorage.setItem("realityng.accessToken", "isolated-demo-fixture");
        localStorage.setItem("realityng.refreshToken", "isolated-demo-fixture");
      });
    await page.route("**/api/v1/**", async (route) => {
      const headers = {
        "Access-Control-Allow-Origin": route.request().headers().origin ?? "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "content-type,x-request-id,authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      };
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      const path = new URL(route.request().url()).pathname;
      let status = 200;
      let body: unknown = { results: [], count: 0 };
      if (path.endsWith("/users/me/")) {
        status = authenticated ? 200 : 401;
        body = {
          id: "isolated-demo-user",
          email: "demo-fixture@example.test",
          first_name: "Synthetic",
          last_name: "Buyer",
          is_active: true,
          is_email_verified: true,
          is_suspended: false,
          profile: {},
          roles: [{ role: { name: "buyer" }, status: "approved" }],
        };
      }
      if (path.endsWith("/assistant/config/"))
        body = {
          enabled: true,
          provider_mode: "demo",
          demo_enabled: true,
          knowledge_enabled: false,
          label: "RealityNG Demo Assistant",
          supported_topics: ["Navigation"],
          suggested_prompts: [],
        };
      if (path.endsWith("/conversations/"))
        body = { id: "owned-demo", status: "active", provider: "demo" };
      if (path.endsWith("/assistant/answer/"))
        throw new Error("Knowledge endpoint must not be used");
      if (path.endsWith("/assistant/demo/")) {
        expect(route.request().postDataJSON()).toEqual({
          query: "Open dashboard",
          knowledge_only: false,
        });
        sent.push("public-demo");
        body = {
          intent: "navigation",
          content: reply,
          sources: [],
          links: [{ label: "Continue in RealityNG", path: "/dashboard" }],
          knowledge_version: null,
          status: "demo",
          provider_metadata: { provider: "demo", mode: "demo" },
        };
      }
      if (path.endsWith("/conversations/owned-demo/messages/")) {
        expect(route.request().postDataJSON()).toEqual({
          content: "Open dashboard",
          knowledge_only: false,
          demo_only: true,
        });
        sent.push("authenticated-demo");
        body = {
          user_message: { id: "du", role: "user", content: "Open dashboard" },
          assistant_message: {
            id: "da",
            role: "assistant",
            content: reply,
            tool_results: [
              {
                tool_use_id: "demo-nav",
                tool: "navigate",
                input: {},
                result: { target: "dashboard", property_id: null, path: "/dashboard" },
              },
            ],
          },
          provider_metadata: { provider: "demo", mode: "demo" },
        };
      }
      await route.fulfill({ status, headers, json: body });
    });
    await page.goto(destination);
    const launch = page.getByRole("button", {
      name: authenticated ? /Open RealityNG (?:AI )?assistant/i : /^Open RealityNG AI$/,
    });
    await launch.click();
    const input = page.getByLabel(authenticated ? "Ask RealityNG assistant" : "Ask RealityNG AI", {
      exact: true,
    });
    await expect(input).toBeEnabled();
    await input.fill("Open dashboard");
    await input.press("Enter");
    await expect(page.getByText(reply)).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: authenticated ? "View dashboard" : "Continue in RealityNG",
        exact: true,
      }),
    ).toHaveAttribute("href", "/dashboard");
    expect(sent).toEqual([authenticated ? "authenticated-demo" : "public-demo"]);
    await input.focus();
    await page.keyboard.press("Escape");
    await expect(launch).toBeFocused();
  });
}


test.describe("portrait motion preferences", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });
  test("portrait uses hover transition without simulated talking", async ({ page }, testInfo) => {
    await page.route("**/api/v1/**", async (route) => {
      const headers = {
        "Access-Control-Allow-Origin": route.request().headers().origin ?? "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "content-type,x-request-id,authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      };
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      const path = new URL(route.request().url()).pathname;
      await route.fulfill({
        status: path.endsWith("/users/me/") ? 401 : 200,
        headers,
        json: path.endsWith("/assistant/config/")
          ? { enabled: true, knowledge_enabled: true, suggested_prompts: [] }
          : { results: [], count: 0 },
      });
    });
    const optimizedImages: import("@playwright/test").Response[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/_next/image?") && response.url().includes("concierge-portrait"))
        optimizedImages.push(response);
    });
    await page.goto("/");
    const launcher = page.getByRole("button", { name: "Open RealityNG AI", exact: true });
    await expect(launcher).toBeVisible();
    const portrait = launcher.locator("[data-assistant-avatar] img");
    await portrait.evaluate((image) => (image as HTMLImageElement).decode());
    const response = optimizedImages[0];
    expect(response).toBeTruthy();
    const bytes = (await response.body()).length;
    expect(bytes).toBeLessThan(100_000);
    await testInfo.attach("portrait-image-delivery", {
      body: JSON.stringify({ bytes, contentType: response.headers()["content-type"] }),
      contentType: "application/json",
    });
    await launcher.hover();
    await expect
      .poll(() => portrait.evaluate((image) => getComputedStyle(image).transitionDuration))
      .toBe("0.15s");
    expect(await portrait.evaluate((image) => getComputedStyle(image).animationName)).toBe("none");
    await expect(launcher.getByText("AI", { exact: true })).toBeVisible();
  });
});
