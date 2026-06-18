import type { Property } from "@/lib/api/properties";

export function formatPrice(property: Property) {
  const amount = Number(property.price);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPropertyType(value: string) {
  return value.replace("_", " ");
}

export function propertySize(property: Property) {
  const size = property.land_size ?? property.floor_area;
  return size ? `${size} sqm` : "N/A";
}
