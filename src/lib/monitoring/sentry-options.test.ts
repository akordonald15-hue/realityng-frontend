import { afterEach, describe, expect, it } from "vitest";

import { sentryOptions } from "./sentry-options";

const originalPublicRelease = process.env.NEXT_PUBLIC_SENTRY_RELEASE;
const originalServerRelease = process.env.SENTRY_RELEASE;
const originalVercelRelease = process.env.VERCEL_GIT_COMMIT_SHA;

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  restoreEnvironment("NEXT_PUBLIC_SENTRY_RELEASE", originalPublicRelease);
  restoreEnvironment("SENTRY_RELEASE", originalServerRelease);
  restoreEnvironment("VERCEL_GIT_COMMIT_SHA", originalVercelRelease);
});

describe("Sentry release configuration", () => {
  it("uses the build-injected public release in browser configuration", () => {
    process.env.NEXT_PUBLIC_SENTRY_RELEASE = "frontend-release";
    process.env.SENTRY_RELEASE = "server-release";
    process.env.VERCEL_GIT_COMMIT_SHA = "vercel-release";

    expect(sentryOptions().release).toBe("frontend-release");
  });
});
