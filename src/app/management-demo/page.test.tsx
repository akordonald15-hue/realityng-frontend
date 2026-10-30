import { afterEach, expect, it, vi } from "vitest";

import Page from "./page";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("404"); } }));
vi.mock("./management-demo", () => ({ ManagementDemo: () => null }));
afterEach(() => vi.unstubAllEnvs());
it("is absent unless explicitly enabled on the server", () => {
  vi.stubEnv("MANAGEMENT_DEMO_UI_ENABLED", "false");
  expect(() => Page()).toThrow("404");
});
it("refuses the production API even when the UI flag is enabled", () => {
  vi.stubEnv("MANAGEMENT_DEMO_UI_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.realityng.com/api/v1");
  vi.stubEnv("MANAGEMENT_DEMO_API_ORIGIN", "https://api.realityng.com");
  expect(() => Page()).toThrow("404");
});
it("renders only for the explicitly matched demo origin", () => {
  vi.stubEnv("MANAGEMENT_DEMO_UI_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:8040/api/v1");
  vi.stubEnv("MANAGEMENT_DEMO_API_ORIGIN", "http://127.0.0.1:8040");
  expect(Page()).toBeTruthy();
});
