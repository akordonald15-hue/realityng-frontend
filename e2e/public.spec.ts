import { expect, test } from "@playwright/test";

import {
  assertNoMaterialOverflow,
  captureEvidence,
  monitorBrowser,
  qaSeed,
} from "./helpers/gate";

test("public and authentication journeys render without browser defects", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  const routes = [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/properties",
    `/properties/${seed.property.slug}`,
    "/services",
    `/services/providers/${seed.provider.slug}`,
  ];

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} returned ${response?.status()}`).toBeTruthy();
    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoMaterialOverflow(page);
  }
  if (["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name)) {
    await page.goto(`/properties/${seed.property.slug}`, { waitUntil: "domcontentloaded" });
    await captureEvidence(page, testInfo, `public-property-${testInfo.project.name}`);
  }
  monitor.assertClean();
});
