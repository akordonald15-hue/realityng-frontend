/**
 * Nigerian mobile number handling.
 *
 * The backend stores `phone_number` as a free-text CharField with a UNIQUE
 * constraint and performs no normalization of its own, so two spellings of the
 * same number are two distinct identities today. Canonicalising what we submit
 * must therefore land together with backend normalization and a migration of
 * existing rows - until then this module is used for validation only, so the
 * user gets useful feedback without us silently changing stored identity.
 */

/** Nigerian country calling code. */
const COUNTRY_CODE = "234";

/**
 * National subscriber number length after the trunk prefix, e.g. the
 * `8031234567` in `0803 123 4567`.
 */
const NSN_LENGTH = 10;

/** Nigerian mobile numbers start 70, 701, 8x or 9x after the trunk prefix. */
const MOBILE_PREFIX = /^[789]/;

function digitsOnly(value: string) {
  return value.replace(/[\s()\-.]/g, "");
}

/**
 * Reduce accepted Nigerian inputs to their national subscriber number.
 * Accepts `08031234567`, `8031234567`, `+2348031234567` and `2348031234567`.
 * Returns null for anything else.
 */
function toNationalNumber(input: string): string | null {
  const cleaned = digitsOnly(input.trim());
  if (cleaned === "") {
    return null;
  }

  const hasPlus = cleaned.startsWith("+");
  const bare = hasPlus ? cleaned.slice(1) : cleaned;

  if (!/^\d+$/.test(bare)) {
    return null;
  }

  let nsn: string;
  if (bare.startsWith(COUNTRY_CODE)) {
    nsn = bare.slice(COUNTRY_CODE.length);
  } else if (hasPlus) {
    // A + that is not +234 is a non-Nigerian number; this module does not own it.
    return null;
  } else if (bare.startsWith("0")) {
    nsn = bare.slice(1);
  } else {
    nsn = bare;
  }

  if (nsn.length !== NSN_LENGTH || !MOBILE_PREFIX.test(nsn)) {
    return null;
  }

  return nsn;
}

/**
 * Canonical E.164 form, e.g. `+2348031234567`.
 * Returns null when the input is not a recognisable Nigerian mobile number.
 * An empty value returns null because the field is optional.
 */
export function normalizeNigerianPhone(input: string | null | undefined): string | null {
  if (input === null || input === undefined || input.trim() === "") {
    return null;
  }

  const nsn = toNationalNumber(input);
  return nsn === null ? null : `+${COUNTRY_CODE}${nsn}`;
}

/**
 * True when the value is blank (the field is optional) or a recognisable
 * Nigerian mobile number.
 */
export function isAcceptableNigerianPhone(input: string | null | undefined): boolean {
  if (input === null || input === undefined || input.trim() === "") {
    return true;
  }
  return normalizeNigerianPhone(input) !== null;
}

export const NIGERIAN_PHONE_MESSAGE =
  "Enter a Nigerian mobile number, for example 08031234567.";
