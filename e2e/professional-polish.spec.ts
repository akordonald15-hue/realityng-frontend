import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { assertNoMaterialOverflow, monitorBrowser, qaSeed, signIn, waitForPageReady } from "./helpers/gate";

async function expectNoSeriousViolations(page: Page, route: string) {
  await waitForPageReady(page);
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

test("Landlord workspace remains responsive and accessible", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "owner");
  const routes = [
    "/dashboard",
    "/dashboard/properties",
    "/properties/new",
    "/dashboard/leads",
    "/dashboard/messages",
    "/dashboard/notifications",
    "/verification",
    "/settings/profile",
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await assertNoMaterialOverflow(page);
  }

  await page.goto("/dashboard/properties", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Sprint 15 Synthetic Lekki Home")).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit" })).toHaveAttribute(
    "href",
    `/dashboard/properties/${seed.property.slug}/edit`,
  );
  await page.goto(`/dashboard/properties/${seed.property.slug}/edit`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Edit Property" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("Sprint 15 Synthetic Lekki Home");

  if (["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name)) {
    for (const route of ["/dashboard", "/dashboard/properties", "/properties/new", "/dashboard/leads"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectNoSeriousViolations(page, route);
    }
  }
  monitor.assertClean();
});

test("Agent workspace does not imply listing or payment authority", async ({ page }, testInfo) => {
  const monitor = monitorBrowser(page);
  await signIn(page, "manager");
  await page.goto("/dashboard/properties", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("You haven't added or been assigned any properties yet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
  await expect(page.locator('nav[aria-label="Professional navigation"]')).toBeAttached();
  await expect(page.locator('nav[aria-label="Professional navigation"]')).not.toContainText("Transactions");
  await assertNoMaterialOverflow(page);

  if (testInfo.project.name.includes("mobile") || testInfo.project.name === "chrome-narrow") {
    const navigation = page.getByRole("navigation", { name: "Professional navigation" });
    const launcher = page.getByRole("button", { name: "Open RealityNG assistant" });
    await expect(navigation).toBeVisible();
    await expect(page.getByRole("link", { name: "Properties" }).last()).toHaveAttribute("aria-current", "page");
    const navigationBox = await navigation.boundingBox();
    const launcherBox = await launcher.boundingBox();
    expect(navigationBox && launcherBox && launcherBox.y + launcherBox.height <= navigationBox.y).toBeTruthy();
  } else {
    await expect(page.getByRole("navigation", { name: "Professional workspace" })).toBeVisible();
  }
  monitor.assertClean();
});
