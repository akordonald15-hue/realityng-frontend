import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/properties",
          "/about",
          "/verification-standards",
          "/listing-standards",
          "/safety",
          "/help",
          "/contact",
          "/privacy",
          "/terms",
          "/data-deletion",
          "/refunds",
        ],
        disallow: [
          "/admin",
          "/dashboard",
          "/settings",
          "/saved-properties",
          "/properties/new",
          "/verification/new",
          "/verification/property/",
          "/apply/",
          "/auth/reset-password",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
