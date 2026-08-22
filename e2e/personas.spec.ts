import { expect, test, type Page } from "@playwright/test";

import {
  allowExpectedStatus,
  assertNoMaterialOverflow,
  authenticatedApiStatus,
  authenticatedWalkthroughUploadDenial,
  captureEvidence,
  clearExpectedStatuses,
  monitorBrowser,
  qaSeed,
  signIn,
  type Persona,
} from "./helpers/gate";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chrome-desktop", "Persona flows run once in installed Chrome.");
});

async function visitRoutes(page: Page, routes: string[]) {
  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoMaterialOverflow(page);
  }
}

test("buyer and owner core surfaces use the real API", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "buyer");
  await visitRoutes(page, [
    "/dashboard",
    "/properties",
    `/properties/${seed.property.slug}`,
    "/saved-properties",
    "/dashboard/messages",
    "/dashboard/notifications",
    "/dashboard/transactions",
    `/dashboard/transactions/${seed.transaction}`,
    `/dashboard/transactions/${seed.transaction}/escrow`,
    "/dashboard/financing",
    `/dashboard/financing/${seed.financing}`,
    "/dashboard/inspections",
    "/dashboard/construction",
  ]);
  await captureEvidence(page, testInfo, "buyer-dashboard");
  monitor.assertClean();

  const ownerPage = await page.context().browser()!.newPage();
  const ownerMonitor = monitorBrowser(ownerPage);
  await signIn(ownerPage, "owner");
  await visitRoutes(ownerPage, [
    "/dashboard",
    `/properties/${seed.property.slug}`,
    `/dashboard/properties/${seed.property.id}/walkthroughs`,
    "/dashboard/leads",
    "/dashboard/transactions",
    `/dashboard/transactions/${seed.transaction}/escrow`,
    "/dashboard/inspections",
    "/dashboard/construction",
    "/dashboard/messages",
  ]);
  ownerMonitor.assertClean();
  await ownerPage.close();
});

test("manager authorization depends on active property assignment", async ({ browser }) => {
  const seed = qaSeed();
  const active = await browser.newPage();
  const activeMonitor = monitorBrowser(active);
  await signIn(active, "manager");
  await active.goto(`/dashboard/properties/${seed.property.id}/walkthroughs`, { waitUntil: "domcontentloaded" });
  await expect(active.getByRole("heading", { name: /walkthrough/i })).toBeVisible();
  expect(await authenticatedApiStatus(active, "/inspections/walkthroughs/manage/")).toBe(200);
  activeMonitor.assertClean();

  const revoked = await browser.newPage();
  allowExpectedStatus(400);
  const revokedMonitor = monitorBrowser(revoked);
  await signIn(revoked, "revoked_manager");
  await revoked.goto(`/dashboard/properties/${seed.property.id}/walkthroughs`, { waitUntil: "domcontentloaded" });
  expect(await authenticatedWalkthroughUploadDenial(revoked, seed.property.id)).toEqual({
    status: 400,
    deniedByAssignment: true,
  });
  clearExpectedStatuses();
  expect(revokedMonitor.failures).toEqual([
    "console.error: Failed to load resource: the server responded with a status of 400 (Bad Request)",
  ]);
  await active.close();
  await revoked.close();
});

test("inspector assignment lifecycle retains the Sprint 15 authorization fix", async ({ browser }, testInfo) => {
  test.setTimeout(180_000);
  const seed = qaSeed();
  async function inspect(persona: Persona, requestId: string, allowed: boolean) {
    const page = await browser.newPage();
    if (!allowed) {
      allowExpectedStatus(403);
      allowExpectedStatus(404);
    }
    const monitor = monitorBrowser(page);
    await signIn(page, persona);
    await page.goto(`/dashboard/inspector/assignments/${requestId}`, { waitUntil: "domcontentloaded" });
    const status = await authenticatedApiStatus(page, `/inspections/requests/${requestId}/`);
    if (allowed) expect(status).toBe(200);
    else expect([403, 404]).toContain(status);
    if (allowed) {
      await expect(page.getByText(/Inspection|Report|Evidence/).first()).toBeVisible();
      await assertNoMaterialOverflow(page);
      monitor.assertClean();
    } else {
      await expect(page.getByText(/Inspection report|Upload evidence/)).toHaveCount(0);
      expect(monitor.failures.every((failure) =>
        failure === "console.error: Failed to load resource: the server responded with a status of 404 (Not Found)" ||
        failure === "pageerror: Request failed with status code 404" ||
        failure.includes("http 403") || failure.includes("http 404"),
      )).toBeTruthy();
      clearExpectedStatuses();
    }
    await page.close();
  }

  await inspect("inspector", seed.inspections.active, true);
  await inspect("former_inspector", seed.inspections.declined, false);
  await inspect("former_inspector", seed.inspections.cancelled, false);
  await inspect("former_inspector", seed.inspections.reassigned, false);
  await inspect("new_inspector", seed.inspections.reassigned, true);

  const evidencePage = await browser.newPage();
  await signIn(evidencePage, "inspector");
  await evidencePage.goto(`/dashboard/inspector/assignments/${seed.inspections.active}`, { waitUntil: "domcontentloaded" });
  await captureEvidence(evidencePage, testInfo, "inspector-active-assignment");
  await evidencePage.close();
});

test("provider and admin surfaces render and normal users cannot gain admin authority", async ({ browser }, testInfo) => {
  const provider = await browser.newPage();
  const providerMonitor = monitorBrowser(provider);
  await signIn(provider, "provider");
  await visitRoutes(provider, ["/dashboard/artisan", "/dashboard/artisan/profile", "/dashboard/artisan/quote-requests"]);
  providerMonitor.assertClean();

  const admin = await browser.newPage();
  const adminMonitor = monitorBrowser(admin);
  await signIn(admin, "admin");
  await visitRoutes(admin, [
    "/admin",
    "/admin/verifications",
    "/admin/services",
    "/admin/services/complaints",
    "/admin/inspections",
    "/admin/construction",
    "/admin/payments",
    "/admin/payments/escrow",
    "/admin/financing",
  ]);
  await captureEvidence(admin, testInfo, "admin-financing-queue");
  adminMonitor.assertClean();

  const normal = await browser.newPage();
  await signIn(normal, "buyer");
  await normal.goto("/admin/financing", { waitUntil: "domcontentloaded" });
  await expect(normal).toHaveURL(/\/dashboard/);
  await Promise.all([provider.close(), admin.close(), normal.close()]);
});
