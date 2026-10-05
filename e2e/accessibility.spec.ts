import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { qaSeed, signIn, waitForPageReady, type Persona } from "./helpers/gate";

type AxeViolation = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];

async function expectNoSeriousAccessibilityViolations(page: Page, context: string) {
  await waitForPageReady(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const launchBlocking = results.violations.filter((violation: AxeViolation) =>
    violation.impact === "critical" || violation.impact === "serious",
  );

  expect(
    launchBlocking.map((violation: AxeViolation) => ({
      context,
      help: violation.help,
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
    `${context} has serious or critical WCAG A/AA violations`,
  ).toEqual([]);
}

test.describe("critical public accessibility", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name),
      "The accessibility matrix uses representative desktop and mobile viewports.",
    );
  });

  for (const route of ["/", "/for-professionals", "/properties", "/auth/sign-in", "/auth/sign-up"]) {
    test(`${route} has no serious automated WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toBeEmpty();
      await page.waitForTimeout(500);
      await expectNoSeriousAccessibilityViolations(page, route);
    });
  }
});

test.describe("critical authenticated accessibility", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chrome-desktop", "Persona scans run once on desktop.");
  });

  const surfaces: Array<{ persona: Persona; route: (seed: ReturnType<typeof qaSeed>) => string }> = [
    { persona: "buyer", route: () => "/dashboard" },
    { persona: "owner", route: () => "/dashboard/properties" },
    { persona: "provider", route: () => "/dashboard/artisan" },
    { persona: "inspector", route: (seed) => `/dashboard/inspector/assignments/${seed.inspections.active}` },
    { persona: "admin", route: () => "/admin" },
  ];

  for (const surface of surfaces) {
    test(`${surface.persona} primary surface has no serious automated WCAG A/AA violations`, async ({ page }) => {
      await signIn(page, surface.persona);
      const route = surface.route(qaSeed());
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/auth\/sign-in/);
      await page.waitForTimeout(500);
      await expectNoSeriousAccessibilityViolations(page, `${surface.persona}:${route}`);
    });
  }
});
