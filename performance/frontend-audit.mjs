import { chromium } from "playwright";

const baseUrl = process.env.FRONTEND_BASE_URL || "https://www.realityng.com";
const routes = (process.env.FRONTEND_ROUTES || "/,/for-professionals,/properties,/auth/sign-in").split(",");
const browser = await chromium.launch({ headless: true });

for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    globalThis.__realityngVitals = { cls: 0, lcp: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) globalThis.__realityngVitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) globalThis.__realityngVitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1_000);
  const result = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      ttfb_ms: navigation.responseStart,
      dom_content_loaded_ms: navigation.domContentLoadedEventEnd,
      load_ms: navigation.loadEventEnd,
      lcp_ms: globalThis.__realityngVitals.lcp,
      cls: globalThis.__realityngVitals.cls,
      requests: resources.length + 1,
      transfer_bytes: resources.reduce((total, entry) => total + (entry.transferSize || 0), navigation.transferSize || 0),
      js_transfer_bytes: resources.filter((entry) => entry.initiatorType === "script").reduce((total, entry) => total + (entry.transferSize || 0), 0),
      image_transfer_bytes: resources.filter((entry) => entry.initiatorType === "img").reduce((total, entry) => total + (entry.transferSize || 0), 0),
    };
  });
  console.log(JSON.stringify({ route, status: response?.status(), ...result }));
  await page.close();
}

await browser.close();
