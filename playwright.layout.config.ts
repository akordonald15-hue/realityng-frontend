import { defineConfig } from "@playwright/test";

// Hermetic browser coverage: API fixtures are intercepted by the spec; no database,
// production credentials, or existing authenticated E2E seed is used.
const port = process.env.REALITYNG_LAYOUT_PORT ?? "3310";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "property-detail-layout.spec.ts",
  workers: 1,
  timeout: 60_000,
  outputDir: "test-results/layout",
  reporter: [["line"], ["html", { open: "never", outputFolder: "playwright-report/layout" }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    contextOptions: { reducedMotion: "reduce" },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [320, 360, 375, 390, 768, 1024, 1440].map(width => ({
    name: `layout-${width}`,
    use: { viewport: { width, height: width < 768 ? 844 : 960 } },
  })),
  webServer: {
    command: 'node -e "const fs=require(\'node:fs\');fs.cpSync(\'public\',\'.next/standalone/public\',{recursive:true});fs.cpSync(\'.next/static\',\'.next/standalone/.next/static\',{recursive:true});require(\'./.next/standalone/server.js\')"',
    url: `http://127.0.0.1:${port}`,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: { HOSTNAME: "127.0.0.1", PORT: port },
  },
});
