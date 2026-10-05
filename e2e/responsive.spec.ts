import { expect, test } from "@playwright/test";

import {
  assertNoMaterialOverflow,
  captureEvidence,
  monitorBrowser,
  qaSeed,
  signIn,
} from "./helpers/gate";

test("authenticated buyer launch surfaces remain usable at the representative viewport", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  const reportRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(`/inspections/requests/${seed.inspections.active}/report/`)) {
      reportRequests.push(request.url());
    }
  });
  await signIn(page, "buyer");

  for (const route of [
    "/dashboard",
    `/dashboard/inspections/${seed.inspections.active}`,
    `/dashboard/transactions/${seed.transaction}`,
    `/dashboard/transactions/${seed.transaction}/escrow`,
    `/dashboard/financing/${seed.financing}`,
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await expect(page.getByRole("main")).not.toBeEmpty();
    await assertNoMaterialOverflow(page);
    if (route === `/dashboard/inspections/${seed.inspections.active}`) {
      await expect(page.getByText("No approved report is available yet.")).toBeVisible();
      expect(reportRequests).toEqual([]);
    }
  }

  if (testInfo.project.name === "chrome-mobile") {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await captureEvidence(page, testInfo, "authenticated-mobile-dashboard");
  }
  monitor.assertClean();
});
