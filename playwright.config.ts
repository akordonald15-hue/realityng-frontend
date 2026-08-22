import { defineConfig } from "@playwright/test";

const chromeExecutable =
  process.env.REALITYNG_CHROME_EXECUTABLE ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const backendEnvironment = {
  DJANGO_SETTINGS_MODULE: "config.settings.browser_qa",
  SECRET_KEY: "local-development-secret",
  DEBUG: "true",
  ALLOWED_HOSTS: "localhost,127.0.0.1",
  CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
  CSRF_TRUSTED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
  DRF_THROTTLE_ANON_RATE: "10000/hour",
  DRF_THROTTLE_USER_RATE: "10000/hour",
  DRF_THROTTLE_AUTH_LOGIN_RATE: "10000/hour",
  DATABASE_URL: "postgres://realityng:realityng@127.0.0.1:55432/realityng",
  REDIS_URL: "redis://127.0.0.1:56379/5",
  CELERY_BROKER_URL: "redis://127.0.0.1:56379/2",
  CELERY_RESULT_BACKEND: "redis://127.0.0.1:56379/3",
  CELERY_TASK_ALWAYS_EAGER: "true",
  CHANNEL_LAYER_REDIS_URL: "redis://127.0.0.1:56379/0",
  REALTIME_OUTBOX_TASKS_ENABLED: "true",
  MINIO_ENDPOINT: "http://127.0.0.1:59000",
  MINIO_PUBLIC_ENDPOINT: "http://127.0.0.1:59000",
  MINIO_ACCESS_KEY: "minioadmin",
  MINIO_SECRET_KEY: "minioadmin",
  USE_S3_MEDIA_STORAGE: "true",
  MINIO_BUCKET_NAME: "realityng-local",
  PAYMENT_PROOF_BUCKET_NAME: "realityng-payment-proof-private",
  FINANCING_DOCUMENT_BUCKET_NAME: "realityng-financing-documents-private",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  globalSetup: "./e2e/global-setup.ts",
  outputDir: "test-results",
  reporter: [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    launchOptions: { executablePath: chromeExecutable },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chrome-desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "chrome-laptop", use: { viewport: { width: 1366, height: 768 } } },
    { name: "chrome-tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "chrome-mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "chrome-narrow", use: { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    {
      command: ".venv\\Scripts\\daphne.exe -b 127.0.0.1 -p 58001 config.asgi:application",
      cwd: "../realityng-backend",
      url: "http://127.0.0.1:58001/api/v1/health/",
      reuseExistingServer: true,
      timeout: 120_000,
      env: backendEnvironment,
    },
    {
      command: "npm run build && npm run start -- -p 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_USE_MOCKS: "false",
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:58001/api/v1",
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "",
      },
    },
  ],
});
