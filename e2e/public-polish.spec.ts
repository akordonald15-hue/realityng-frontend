import { expect, test } from "@playwright/test";

import { assertNoMaterialOverflow } from "./helpers/gate";

test("reduced motion preserves content and keyboard access to the assistant", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toBeVisible();
  const launcher = page.getByRole("button", { name: "Open RealityNG AI" });
  await launcher.focus();
  await page.keyboard.press("Enter");
  const input = page.getByLabel("Ask RealityNG AI");
  await expect(input).toBeFocused();
  const panel = page.getByRole("region", { name: "RealityNG AI assistant" });
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  await assertNoMaterialOverflow(page);
});

test("E2b public surfaces remain responsive", async ({ page }) => {
  for (const route of ["/", "/for-professionals", "/properties"]) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} returned ${response?.status()}`).toBeTruthy();
    await expect(page.locator("h1")).toBeVisible();
    await assertNoMaterialOverflow(page);
  }
});

test("mobile public controls do not obscure or overflow content", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && testInfo.project.name !== "chrome-narrow");
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const menuTrigger = page.getByRole("button", { name: "Toggle navigation" });
  await expect(menuTrigger).toHaveAttribute("aria-expanded", "false");
  await page.waitForTimeout(500);
  await menuTrigger.click();
  await expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await assertNoMaterialOverflow(page);
  await page.keyboard.press("Escape");
  await expect(menuTrigger).toBeFocused();

  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Open RealityNG AI" }).click();
  await expect(page.getByLabel("Ask RealityNG AI")).toBeFocused();
  await expect(page.getByRole("region", { name: "RealityNG AI assistant" })).toBeVisible();
  await assertNoMaterialOverflow(page);
});
