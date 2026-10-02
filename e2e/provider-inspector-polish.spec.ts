import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  allowExpectedStatus,
  assertNoMaterialOverflow,
  clearExpectedStatuses,
  monitorBrowser,
  qaSeed,
  signIn,
} from "./helpers/gate";

async function expectNoSeriousViolations(page: Page, route: string) {
  await page.waitForTimeout(500);
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
      nodes: violation.nodes.map((node) => ({
        failureSummary: node.failureSummary,
        target: node.target.join(" "),
      })),
      route,
    })),
    `${route} has serious or critical accessibility violations`,
  ).toEqual([]);
}

test("provider workspace is coherent across operational routes", async ({ page }, testInfo) => {
  const monitor = monitorBrowser(page);
  await signIn(page, "provider");
  const routes = [
    "/dashboard/artisan",
    "/dashboard/artisan/profile",
    "/dashboard/artisan/portfolio",
    "/dashboard/artisan/quote-requests",
    "/dashboard/artisan/reviews",
    "/dashboard/messages",
    "/dashboard/notifications",
    "/verification",
  ];

  for (const route of routes) {
    const failureCount = monitor.failures.length;
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await assertNoMaterialOverflow(page);
    expect(monitor.failures.slice(failureCount), `Browser failures on ${route}`).toEqual([]);
  }

  await page.goto("/dashboard/artisan/quote-requests", { waitUntil: "domcontentloaded" });
  await expect(page.locator('nav[aria-label="Provider navigation"]')).toBeAttached();
  if (testInfo.project.name.includes("mobile")) {
    await expect(page.getByRole("navigation", { name: "Provider navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Requests" }).last()).toHaveAttribute("aria-current", "page");
  } else {
    await expect(page.getByRole("navigation", { name: "Provider workspace" })).toBeVisible();
  }

  if (["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name)) {
    for (const route of ["/dashboard/artisan", "/dashboard/artisan/profile", "/dashboard/artisan/quote-requests"]) {
      const failureCount = monitor.failures.length;
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectNoSeriousViolations(page, route);
      expect(monitor.failures.slice(failureCount), `Browser failures during accessibility scan on ${route}`).toEqual([]);
    }
  }
  monitor.assertClean();
});

test("inspector workspace preserves active and stale assignment boundaries", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "inspector");
  const routes = [
    "/dashboard/inspector",
    "/dashboard/inspector/assignments",
    `/dashboard/inspector/assignments/${seed.inspections.active}`,
    "/dashboard/messages",
    "/dashboard/notifications",
    "/settings/profile",
  ];

  for (const route of routes) {
    const failureCount = monitor.failures.length;
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await assertNoMaterialOverflow(page);
    expect(monitor.failures.slice(failureCount), `Browser failures on ${route}`).toEqual([]);
  }

  await page.goto(`/dashboard/inspector/assignments/${seed.inspections.active}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Private evidence|Draft report/).first()).toBeVisible();
  await expect(page.locator('nav[aria-label="Inspector navigation"]')).toBeAttached();
  if (testInfo.project.name.includes("mobile")) {
    await expect(page.getByRole("navigation", { name: "Inspector navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Assignments" }).last()).toHaveAttribute("aria-current", "page");
  } else {
    await expect(page.getByRole("navigation", { name: "Inspector workspace" })).toBeVisible();
  }

  if (["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name)) {
    for (const route of ["/dashboard/inspector", `/dashboard/inspector/assignments/${seed.inspections.active}`]) {
      const failureCount = monitor.failures.length;
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectNoSeriousViolations(page, route);
      expect(monitor.failures.slice(failureCount), `Browser failures during accessibility scan on ${route}`).toEqual([]);
    }
  }
  monitor.assertClean();
});

test("stale inspector assignments fail closed with a useful state", async ({ page }) => {
  const seed = qaSeed();
  allowExpectedStatus(404);
  await signIn(page, "former_inspector");
  await page.goto(`/dashboard/inspector/assignments/${seed.inspections.reassigned}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "This assignment is no longer available" })).toBeVisible();
  await expect(page.getByText(/Private evidence|Draft report/)).toHaveCount(0);
  clearExpectedStatuses();
});
