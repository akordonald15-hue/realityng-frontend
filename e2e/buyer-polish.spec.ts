import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { assertNoMaterialOverflow, monitorBrowser, qaSeed, signIn } from "./helpers/gate";

async function expectNoSeriousViolations(page: Page, route: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(
    blocking.map((violation) => ({ id: violation.id, route })),
    `${route} has serious or critical accessibility violations`,
  ).toEqual([]);
}

test("Buyer surfaces remain responsive and accessible", async ({ page }, testInfo) => {
  const seed = qaSeed();
  const monitor = monitorBrowser(page);
  await signIn(page, "buyer");
  const routes = [
    "/dashboard",
    "/saved-properties",
    "/dashboard/messages",
    `/dashboard/messages/${seed.thread}`,
    "/dashboard/notifications",
    "/settings/profile",
    "/settings/notifications",
    "/dashboard/transactions",
    `/dashboard/transactions/${seed.transaction}`,
    "/dashboard/financing",
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await assertNoMaterialOverflow(page);
  }

  if (["chrome-desktop", "chrome-mobile"].includes(testInfo.project.name)) {
    for (const route of ["/dashboard", "/saved-properties", "/dashboard/messages", "/settings/profile"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectNoSeriousViolations(page, route);
    }
  }
  monitor.assertClean();
});

test("Buyer mobile navigation and assistant never collide", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && testInfo.project.name !== "chrome-narrow");
  await signIn(page, "buyer");
  await page.goto("/dashboard/messages", { waitUntil: "domcontentloaded" });

  const navigation = page.getByRole("navigation", { name: "Buyer navigation" });
  const launcher = page.getByRole("button", { name: "Open RealityNG assistant" });
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("link", { name: "Messages" })).toHaveAttribute("aria-current", "page");
  await expect(launcher).toBeVisible();

  const navigationBox = await navigation.boundingBox();
  const launcherBox = await launcher.boundingBox();
  expect(navigationBox && launcherBox && launcherBox.y + launcherBox.height <= navigationBox.y).toBeTruthy();

  await launcher.click();
  const assistant = page.getByRole("region", { name: "RealityNG assistant" });
  await expect(assistant).toBeVisible();
  const assistantBox = await assistant.boundingBox();
  expect(navigationBox && assistantBox && assistantBox.y + assistantBox.height <= navigationBox.y).toBeTruthy();
  await assertNoMaterialOverflow(page);
});
