import { expect, test } from "@playwright/test";

import {
  allowExpectedStatus,
  assertNoMaterialOverflow,
  authenticatedSignedUrlCheck,
  captureEvidence,
  clearExpectedStatuses,
  monitorBrowser,
  qaSeed,
  signIn,
} from "./helpers/gate";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chrome-desktop", "Financial gate runs once in installed Chrome.");
});

test("financial UI wording and private URLs remain safe", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "buyer");
  for (const route of [
    "/dashboard/transactions",
    `/dashboard/transactions/${seed.transaction}`,
    `/dashboard/transactions/${seed.transaction}/escrow`,
    "/dashboard/financing",
    "/dashboard/financing/apply",
    `/dashboard/financing/${seed.financing}`,
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await assertNoMaterialOverflow(page);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/RealityNG (holds|guarantees|underwrites|lends)/i);
    expect(text).not.toMatch(/http:\/\/(minio|127\.0\.0\.1:59000)\//i);
    if (route.endsWith("/escrow")) {
      await captureEvidence(page, testInfo, "transaction-escrow");
    }
    if (route === `/dashboard/financing/${seed.financing}`) {
      await captureEvidence(page, testInfo, "financing-application");
    }
  }
  monitor.assertClean();
});

test("admin financial pages render with partner-owned language", async ({ page }) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "admin");
  for (const route of [
    "/admin/payments",
    "/admin/payments/escrow",
    "/admin/financing",
    `/admin/financing/${seed.financing}`,
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await assertNoMaterialOverflow(page);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/RealityNG (holds|guarantees|underwrites|lends)/i);
    expect(text).not.toMatch(/http:\/\/(minio|127\.0\.0\.1:59000)\//i);
  }
  monitor.assertClean();
});

test("private inspection, payment, and financing files require authorized signed access", async ({ page }) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  const paths = [
    `/inspections/reports/${seed.private_documents.inspection_report}/signed-url/`,
    `/inspections/evidence/${seed.private_documents.inspection_evidence}/signed-url/`,
    `/payment-proofs/${seed.private_documents.payment_proof}/signed-url/`,
    `/financing-documents/${seed.private_documents.financing_document}/signed-url/`,
  ];

  await signIn(page, "buyer");
  for (const path of paths) {
    const result = await authenticatedSignedUrlCheck(page, path);
    expect(result).toEqual({ status: 200, hasUrl: true, usesPrivateStorage: true, hasSignature: true });
  }

  await signIn(page, "nonparticipant");
  allowExpectedStatus(404);
  for (const path of paths) {
    const result = await authenticatedSignedUrlCheck(page, path);
    expect(result.status).toBe(404);
    expect(result.hasUrl).toBeFalsy();
  }
  clearExpectedStatuses();
  expect(monitor.failures).toHaveLength(paths.length);
  expect(monitor.failures.every(
    (failure) => failure === "console.error: Failed to load resource: the server responded with a status of 404 (Not Found)",
  )).toBeTruthy();
});
