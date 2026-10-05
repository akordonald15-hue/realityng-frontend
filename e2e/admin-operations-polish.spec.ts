import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { assertNoMaterialOverflow, monitorBrowser, signIn, waitForPageReady } from "./helpers/gate";

test.setTimeout(300_000);

async function expectNoSeriousViolations(page: Page, route: string) {
  await waitForPageReady(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(
    blocking.map((violation) => ({
      help: violation.help,
      id: violation.id,
      route,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
}

test("admin operations retain coherent navigation and accessible dense queues", async ({ page }, testInfo) => {
  const monitor = monitorBrowser(page);
  await signIn(page, "admin");
  const routes = [
    "/admin",
    "/admin/verifications",
    "/admin/inspections/requests",
    "/admin/inspections/walkthroughs",
    "/admin/inspections/reports",
    "/admin/services/providers",
    "/admin/services/reviews",
    "/admin/services/complaints",
    "/admin/services/appeals",
    "/admin/payments/escrow",
    "/admin/financing",
    "/admin/construction",
  ];

  for (const route of routes) {
    const failureCount = monitor.failures.length;
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();
    await assertNoMaterialOverflow(page);
    expect(monitor.failures.slice(failureCount), `Browser failures on ${route}`).toEqual([]);
  }

  if (["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name)) {
    for (const route of ["/admin", "/admin/verifications", "/admin/services/providers"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectNoSeriousViolations(page, route);
    }
  }
  monitor.assertClean();
});
