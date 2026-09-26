import { describe, expect, it } from "vitest";

import {
  isAcceptableNigerianPhone,
  normalizeNigerianPhone,
} from "@/lib/auth/nigerian-phone";

describe("normalizeNigerianPhone", () => {
  it("normalizes every accepted Nigerian spelling to one canonical value", () => {
    const canonical = "+2348031234567";
    for (const input of [
      "08031234567",
      "8031234567",
      "+2348031234567",
      "2348031234567",
      "0803 123 4567",
      "+234 803 123 4567",
      "(0803) 123-4567",
    ]) {
      expect(normalizeNigerianPhone(input)).toBe(canonical);
    }
  });

  it("accepts the 70, 80, 81, 90 and 91 mobile ranges", () => {
    expect(normalizeNigerianPhone("07011234567")).toBe("+2347011234567");
    expect(normalizeNigerianPhone("08121234567")).toBe("+2348121234567");
    expect(normalizeNigerianPhone("09011234567")).toBe("+2349011234567");
    expect(normalizeNigerianPhone("09161234567")).toBe("+2349161234567");
  });

  it("treats a blank optional value as absent rather than invalid", () => {
    expect(normalizeNigerianPhone("")).toBeNull();
    expect(normalizeNigerianPhone("   ")).toBeNull();
    expect(normalizeNigerianPhone(null)).toBeNull();
    expect(normalizeNigerianPhone(undefined)).toBeNull();
    expect(isAcceptableNigerianPhone("")).toBe(true);
    expect(isAcceptableNigerianPhone(null)).toBe(true);
  });

  it("rejects malformed +234 numbers", () => {
    expect(normalizeNigerianPhone("+234803123456")).toBeNull(); // one digit short
    expect(normalizeNigerianPhone("+23480312345678")).toBeNull(); // one digit long
    expect(normalizeNigerianPhone("+234")).toBeNull();
    expect(normalizeNigerianPhone("+2340031234567")).toBeNull(); // invalid mobile prefix
  });

  it("rejects letters and other junk", () => {
    expect(normalizeNigerianPhone("not a phone")).toBeNull();
    expect(normalizeNigerianPhone("0803ABC4567")).toBeNull();
    expect(normalizeNigerianPhone("+234-803-CALL-NOW")).toBeNull();
  });

  it("rejects numbers that are too short or too long", () => {
    expect(normalizeNigerianPhone("0803")).toBeNull();
    expect(normalizeNigerianPhone("080312345")).toBeNull();
    expect(normalizeNigerianPhone("080312345678")).toBeNull();
  });

  it("does not claim ownership of non-Nigerian international numbers", () => {
    expect(normalizeNigerianPhone("+14155552671")).toBeNull();
    expect(normalizeNigerianPhone("+447911123456")).toBeNull();
    expect(isAcceptableNigerianPhone("+14155552671")).toBe(false);
  });

  it("collapses formatting variants that would otherwise become duplicate identities", () => {
    // The backend's UNIQUE constraint is on the raw string, so these four rows
    // could coexist today. They must all reduce to one canonical value.
    const variants = ["08031234567", "8031234567", "+2348031234567", "2348031234567"];
    const normalized = new Set(variants.map((v) => normalizeNigerianPhone(v)));
    expect(normalized.size).toBe(1);
  });
});
