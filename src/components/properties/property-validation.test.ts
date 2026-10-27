import { describe, expect, it } from "vitest";
import { zodResolver } from "@hookform/resolvers/zod";

import { propertyFormSchema } from "@/components/properties/property-form";
import { emailSchema } from "@/lib/auth/email-schema";

const valid = {
  title: "Modern Lekki Apartment",
  description: "A clean apartment close to major roads.",
  property_type: "apartment",
  listing_type: "rent",
  price: "2500000",
  currency: "NGN",
  country: "Nigeria",
  state: "Lagos",
  city: "Lagos",
  address: "Admiralty Way",
  location_precision: "neighborhood",
  floor_area: "180",
  bedrooms: "",
  bathrooms: "",
  parking_spaces: "",
};

describe("Zod 4 form compatibility", () => {
  it.each([
    "ada@example.com",
    "ada+viewing@example.com",
    "a_b.c@example.com",
    "o'hara@example.com",
  ])("preserves accepted email %s", (email) => {
    expect(emailSchema.parse(email)).toBe(email);
  });
  it.each([
    "",
    "not-an-email",
    ".ada@example.com",
    "ada..okafor@example.com",
    "ada@example",
    " ada@example.com",
  ])("rejects invalid email %s with the existing message", (email) => {
    const result = emailSchema.safeParse(email);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toBe("Enter a valid email address.");
  });
  it("retains numeric coercion and existing optional blank-count behavior", () => {
    const parsed = propertyFormSchema.parse(valid);
    expect(parsed).toMatchObject({
      price: 2500000,
      floor_area: 180,
      bedrooms: 0,
      bathrooms: 0,
      parking_spaces: 0,
    });
    expect(propertyFormSchema.parse({ ...valid, bedrooms: undefined }).bedrooms).toBeUndefined();
  });
  it.each(["", "invalid", 0, -1, Infinity, -Infinity, "Infinity", NaN])(
    "rejects invalid required price %s",
    (price) => {
      expect(propertyFormSchema.safeParse({ ...valid, price }).success).toBe(false);
    },
  );
  it.each(["invalid", -1, 1.5, Infinity, "Infinity", Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid count %s",
    (bedrooms) => {
      expect(propertyFormSchema.safeParse({ ...valid, bedrooms }).success).toBe(false);
    },
  );
  it.each([
    [{ floor_area: "" }, "floor_area", "Built property listings require floor area."],
    [{ property_type: "land", land_size: "" }, "land_size", "Land listings require land size."],
    [
      { listing_type: "apartment_share", property_type: "house" },
      "property_type",
      "Apartment share listings must use the apartment property type.",
    ],
    [
      { show_exact_location: true },
      "location_precision",
      "Exact location can only be shown when location precision is exact.",
    ],
  ])("preserves cross-field rules %j", (changes, field, message) => {
    const result = propertyFormSchema.safeParse({ ...valid, ...changes });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: [field], message }),
      );
  });
  it("returns nested field errors rather than throwing, and returns parsed values for valid input", async () => {
    const resolver = zodResolver(propertyFormSchema);
    const options = { fields: {}, shouldUseNativeValidation: false, criteriaMode: "all" as const };
    const invalid = await resolver(
      { ...valid, title: "", bedrooms: -1 } as never,
      undefined,
      options,
    );
    expect(invalid.values).toEqual({});
    expect(invalid.errors.title?.message).toBe("Enter a descriptive title.");
    expect(invalid.errors.bedrooms?.message).toBeTruthy();
    const accepted = await resolver(valid as never, undefined, options);
    expect(accepted.errors).toEqual({});
    expect(accepted.values).toMatchObject({ price: 2500000, floor_area: 180 });
  });
});
