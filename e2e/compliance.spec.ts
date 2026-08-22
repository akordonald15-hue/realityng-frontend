import { expect, test } from "@playwright/test";

import {
  allowExpectedStatus,
  assertNoMaterialOverflow,
  clearExpectedStatuses,
  monitorBrowser,
  signIn,
} from "./helpers/gate";

test("public compliance disclosures and required registration consent are usable", async ({ page }) => {
  const monitor = monitorBrowser(page);
  const routes = [
    ["/terms", "RealityNG platform terms"],
    ["/privacy", "How RealityNG thinks about personal data"],
    ["/financing-disclosure", "Financing decisions belong to the financing partner"],
    ["/escrow-disclosure", "RealityNG records partner escrow workflows"],
    ["/fraud-reporting", "Pause the workflow and report suspected fraud"],
  ] as const;

  for (const [route, heading] of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await assertNoMaterialOverflow(page);
  }

  await page.goto("/auth/sign-up");
  await page.getByLabel("Email").fill("consent-browser@example.com");
  await page.getByLabel("Password").fill("Str0ngPass123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Accept the Terms to continue.")).toBeVisible();
  await expect(page.getByText("Acknowledge the Privacy Notice to continue.")).toBeVisible();
  await expect(page.getByLabel(/I accept the Terms/)).not.toBeChecked();
  await expect(page.getByLabel(/I acknowledge the Privacy Notice/)).not.toBeChecked();
  monitor.assertClean();
});

test("protected compliance operations reject anonymous users and permit seeded admin", async ({ page }) => {
  const monitor = monitorBrowser(page);
  allowExpectedStatus(401);
  await page.goto("/admin/financing");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  clearExpectedStatuses();

  await signIn(page, "admin");
  await page.goto("/admin/financing");
  await expect(page.getByRole("heading", { name: /financing/i })).toBeVisible();
  await assertNoMaterialOverflow(page);
  monitor.assertClean();
});
