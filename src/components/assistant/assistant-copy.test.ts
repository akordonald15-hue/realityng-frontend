import { describe, expect, it } from "vitest";
import { assistantDisplayText, ASSISTANT_UNSUPPORTED, ASSISTANT_WELCOME } from "./assistant-copy";

describe("assistant customer-facing copy", () => {
  it("preserves the approved welcome paragraphs verbatim", () => {
    expect(ASSISTANT_WELCOME).toBe(
      "Hi! Welcome to RealityNG. 👋\n\nI'm here to help you understand how RealityNG works, find your way around the platform, and guide you through property searches, viewings, rentals and account verification.\n\nWhat would you like help with?",
    );
  });
  it.each([
    [
      "Hello, I am the RealityNG Demo Assistant. I can guide you through property discovery, viewings, rental applications, verification, and support.",
      "Hi! I'm your RealityNG property assistant. I can guide you through property discovery, viewings, rental applications, verification, and support.",
    ],
    [
      "You can continue in RealityNG at /dashboard. I can only suggest approved app destinations in demo mode.",
      "You can continue in RealityNG at /dashboard. Use the link below to continue.",
    ],
    [
      "Use Browse Properties to search approved listings by city, property type, listing type, price range, and keywords. In demo mode I will not invent properties, prices, or availability.",
      "Use Browse Properties to search approved listings by city, property type, listing type, price range, and keywords. Check each listing for details, and confirm current prices and availability with its owner or agent.",
    ],
    [
      "I am currently a guided demo assistant. I can help with property search guidance, viewing requests, rental applications, verification, support, and approved app navigation. I cannot answer unsupported questions or fabricate private, legal, pricing, or listing details.",
      ASSISTANT_UNSUPPORTED,
    ],
  ])("presents existing response copy without changing its source", (raw, displayed) => {
    expect(assistantDisplayText(raw)).toBe(displayed);
    expect(displayed).not.toMatch(/demo|live model|synthesis/i);
  });
  it.each([
    "Reviewed guidance from the knowledge service.",
    "Account approval does not verify a listing.",
    "Quoted text about demo mode is not a known legacy response.",
  ])("leaves other response text untouched", (content) => {
    expect(assistantDisplayText(content)).toBe(content);
  });
});
