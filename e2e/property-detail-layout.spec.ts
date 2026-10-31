import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#075e48"/><text x="70" y="210" fill="white" font-size="28">SYNTHETIC PROPERTY TEST</text></svg>')}`;
const property = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "synthetic-layout-property",
  title: "Synthetic layout property",
  description: "Synthetic property used only for isolated responsive regression checks.",
  property_type: "apartment",
  listing_type: "rent",
  price: "2400000",
  currency: "NGN",
  country: "Nigeria",
  state: "Lagos",
  city: "Lekki",
  address: "Synthetic test avenue",
  floor_area: "100",
  bedrooms: 2,
  bathrooms: 2,
  parking_spaces: 0,
  status: "approved",
  featured: false,
  cover_image_url: image,
  image_count: 1,
  created_at: "2026-10-31T09:00:00Z",
};

test("property content fits the viewport while similar properties scroll independently", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/api/v1/**", async route => {
    const headers = {
      "Access-Control-Allow-Origin": route.request().headers().origin ?? "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type,x-request-id,authorization",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    expect(route.request().method()).toBe("GET");
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/v1/users/me/") {
      await route.fulfill({ status: 401, json: { detail: "Anonymous layout fixture" }, headers });
      return;
    }
    let body: unknown;
    if (path === `/api/v1/public/properties/${property.slug}/`) body = property;
    else if (path === "/api/v1/public/properties/") body = {
      count: 6, next: null, previous: null,
      results: Array.from({ length: 6 }, (_, index) => ({
        ...property, id: `similar-${index}`, slug: `similar-${index}`, title: `Similar synthetic property ${index}`,
      })),
    };
    else if (path.endsWith("/walkthroughs/public/")) body = [];
    else throw new Error(`Unexpected API request in isolated layout test: ${path}`);
    await route.fulfill({ json: body, headers });
  });
  await page.goto(`/properties/${property.slug}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "About this property", exact: true })).toBeVisible();
  const similar = page.getByRole("heading", { name: "Similar properties", exact: true }).locator("..").locator("..");
  await expect(similar.getByRole("link", { name: /View Similar synthetic property/ })).toHaveCount(4);
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll("img").forEach(img => { img.loading = "eager"; });
  });
  await expect.poll(() => page.locator("img").evaluateAll(imgs => imgs.every(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)), { timeout: 15_000 }).toBe(true);
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
  await writeFile(testInfo.outputPath("measurements.json"), JSON.stringify(dimensions, null, 2));
  await testInfo.attach("viewport-measurements", { body: JSON.stringify(dimensions), contentType: "application/json" });
  await page.screenshot({ path: testInfo.outputPath("property-detail.png"), fullPage: true });
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);

  if (dimensions.viewport <= 768) {
    // Exercise the actual carousel rather than hiding overflow on the document.
    const carousel = similar.locator("div.overflow-x-auto").first();
    await expect(carousel).toBeVisible();
    const scroll = await carousel.evaluate(element => {
      const before = element.scrollLeft;
      element.scrollLeft = 200;
      return { before, after: element.scrollLeft, width: element.clientWidth, content: element.scrollWidth };
    });
    expect(scroll.content).toBeGreaterThan(scroll.width);
    expect(scroll.after).toBeGreaterThan(scroll.before);
  }
  expect(errors).toEqual([]);
});
