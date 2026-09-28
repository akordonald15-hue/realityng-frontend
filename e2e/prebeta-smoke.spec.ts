import { expect, test } from "@playwright/test";

import { monitorBrowser, qaSeed, signIn } from "./helpers/gate";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chrome-desktop", "Pre-beta mutation smoke runs once.");
});

test("synthetic buyer can save and inspect application and viewing state, then logout", async ({ page }) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "buyer");

  const result = await page.evaluate(async ({ apiBase, propertyId }) => {
    const token = window.localStorage.getItem("realityng.accessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const existing = await fetch(`${apiBase}/favorites/`, { headers });
    const existingPayload = await existing.json() as {
      results: Array<{ property: { id: string } }>;
    };
    const existingFavorite = existingPayload.results.find(
      (favorite) => favorite.property.id === propertyId,
    );
    const savedStatus = existingFavorite ? 200 : (await fetch(`${apiBase}/favorites/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ property_id: propertyId }),
    })).status;
    const applications = await fetch(`${apiBase}/applications/`, { headers });
    const viewings = await fetch(`${apiBase}/viewings/`, { headers });
    return {
      saved: savedStatus,
      applications: (await applications.json() as { count: number }).count,
      viewings: (await viewings.json() as { count: number }).count,
    };
  }, {
    apiBase: process.env.REALITYNG_E2E_API_BASE_URL ?? "http://127.0.0.1:58001/api/v1",
    propertyId: seed.property.id,
  });

  expect([200, 201]).toContain(result.saved);
  expect(result.applications).toBeGreaterThan(0);
  expect(result.viewings).toBeGreaterThan(0);

  await page.goto("/saved-properties", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(seed.property.slug, { exact: false }).or(page.getByText(/Sprint 15 Synthetic/i)).first()).toBeVisible();

  await page.getByText("Account", { exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  monitor.assertClean();
});
