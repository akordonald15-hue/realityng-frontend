import type { Breadcrumb, ErrorEvent, EventHint } from "@sentry/nextjs";

const FILTERED = "[Filtered]";
const SENSITIVE_PARTS = [
  "authorization",
  "cookie",
  "credential",
  "password",
  "secret",
  "token",
  "access_key",
  "applicationkey",
  "signature",
  "x_amz_",
];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replaceAll("-", "_");
  return SENSITIVE_PARTS.some((part) => normalized.includes(part));
}

function scrubValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        isSensitiveKey(key) ? FILTERED : scrubValue(item),
      ]),
    );
  }
  return value;
}

function scrubUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value, "https://monitoring.invalid");
    for (const key of [...url.searchParams.keys()]) {
      if (isSensitiveKey(key)) url.searchParams.set(key, FILTERED);
    }
    return value.startsWith("http")
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

export function beforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  const scrubbed = scrubValue(event) as ErrorEvent;
  if (scrubbed.request) {
    scrubbed.request.url = scrubUrl(scrubbed.request.url) as string | undefined;
    delete scrubbed.request.data;
    delete scrubbed.request.cookies;
  }
  if (scrubbed.user) {
    scrubbed.user = scrubbed.user.id ? { id: scrubbed.user.id } : {};
  }
  return scrubbed;
}

export function beforeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === "console") return null;
  const scrubbed = scrubValue(breadcrumb) as Breadcrumb;
  if (scrubbed.data?.url) scrubbed.data.url = scrubUrl(scrubbed.data.url);
  return scrubbed;
}
