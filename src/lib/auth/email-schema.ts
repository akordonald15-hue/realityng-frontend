import { z } from "zod";

// Preserve the Zod 3 email policy, including underscores in dotted local parts.
// Zod 4's default email pattern rejects some previously accepted addresses.
export const emailSchema = z.email({
  pattern: /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
  error: "Enter a valid email address.",
});
