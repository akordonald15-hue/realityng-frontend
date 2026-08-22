import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, type Page, type TestInfo } from "@playwright/test";

type Seed = {
  password: string;
  users: Record<string, string>;
  property: { id: string; slug: string };
  provider: { id: string; slug: string };
  inspections: Record<string, string>;
  private_documents: {
    inspection_report: string;
    inspection_evidence: string;
    payment_proof: string;
    financing_document: string;
  };
  transaction: string;
  escrow: string;
  financing: string;
  thread: string;
};

export type Persona =
  | "buyer"
  | "owner"
  | "manager"
  | "revoked_manager"
  | "inspector"
  | "former_inspector"
  | "new_inspector"
  | "provider"
  | "nonparticipant"
  | "admin";

let cachedSeed: Seed | undefined;

const expectedNegativeStatuses = new Set<number>();

export function allowExpectedStatus(status: number) {
  expectedNegativeStatuses.add(status);
}

export function clearExpectedStatuses() {
  expectedNegativeStatuses.clear();
}

export function monitorBrowser(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      message.text() !== "Failed to load resource: the server responded with a status of 401 (Unauthorized)"
    ) {
      failures.push(`console.error: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    const url = redactUrl(request.url());
    if (request.failure()?.errorText === "net::ERR_ABORTED" && new URL(url).searchParams.has("_rsc")) {
      return;
    }
    failures.push(`requestfailed: ${request.failure()?.errorText ?? "unknown"} ${url}`);
  });
  page.on("response", (response) => {
    const status = response.status();
    const pathname = new URL(response.url()).pathname;
    if (status === 401 && pathname.endsWith("/api/v1/users/me/")) return;
    if (status >= 400 && !expectedNegativeStatuses.has(status)) {
      failures.push(`http ${status}: ${redactUrl(response.url())}`);
    }
  });
  return {
    assertClean() {
      expect(failures, failures.join("\n")).toEqual([]);
    },
    failures,
  };
}

export async function signIn(page: Page, persona: Persona) {
  const seed = qaSeed();
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(seed.users[persona]);
  await page.getByLabel("Password").fill(seed.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/sign-in"));
  await expect(page.getByText("Demo mode is active")).toHaveCount(0);
}

export async function assertNoMaterialOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2);
}

export async function authenticatedApiStatus(
  page: Page,
  pathName: string,
  method = "GET",
) {
  return page.evaluate(async ({ requestedPath, requestedMethod }) => {
    const token = window.localStorage.getItem("realityng.accessToken");
    const response = await fetch(`http://127.0.0.1:58001/api/v1${requestedPath}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      method: requestedMethod,
    });
    return response.status;
  }, { requestedPath: pathName, requestedMethod: method });
}

export async function authenticatedSignedUrlCheck(page: Page, pathName: string) {
  return page.evaluate(async (requestedPath) => {
    const token = window.localStorage.getItem("realityng.accessToken");
    const response = await fetch(`http://127.0.0.1:58001/api/v1${requestedPath}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = response.ok ? await response.json() as { url?: string } : {};
    const signedUrl = payload.url ? new URL(payload.url) : null;
    return {
      status: response.status,
      hasUrl: Boolean(signedUrl),
      usesPrivateStorage: signedUrl?.host === "127.0.0.1:59000",
      hasSignature: Boolean(
        signedUrl && [...signedUrl.searchParams.keys()].some((key) => /signature|credential/i.test(key)),
      ),
    };
  }, pathName);
}

export async function authenticatedWalkthroughUploadDenial(page: Page, propertyId: string) {
  return page.evaluate(async (requestedPropertyId) => {
    const token = window.localStorage.getItem("realityng.accessToken");
    const form = new FormData();
    form.set("title", "Synthetic revoked-manager authorization probe");
    form.set("video_file", new File(
      [new Uint8Array([0, 0, 0, 16, 102, 116, 121, 112, 105, 115, 111, 109])],
      "authorization-probe.mp4",
      { type: "video/mp4" },
    ));
    const response = await fetch(
      `http://127.0.0.1:58001/api/v1/inspections/properties/${requestedPropertyId}/walkthroughs/`,
      {
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        method: "POST",
      },
    );
    const body = await response.text();
    return {
      status: response.status,
      deniedByAssignment: body.includes("cannot upload walkthroughs for this property"),
    };
  }, propertyId);
}

export async function captureEvidence(page: Page, testInfo: TestInfo, name: string) {
  const safeName = name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  await page.screenshot({
    path: testInfo.outputPath(`${safeName}.png`),
    fullPage: true,
  });
}

export function qaSeed() {
  cachedSeed ??= JSON.parse(
    readFileSync(path.resolve(process.cwd(), "e2e/.generated/seed.json"), "utf8"),
  ) as Seed;
  return cachedSeed;
}

function redactUrl(value: string) {
  const url = new URL(value);
  for (const key of [...url.searchParams.keys()]) {
    if (/token|jwt|access|refresh|signature|credential/i.test(key)) {
      url.searchParams.set(key, "[REDACTED]");
    }
  }
  return url.toString();
}
