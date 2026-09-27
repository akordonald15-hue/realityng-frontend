import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const sentryRelease = process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  env: {
    NEXT_PUBLIC_SENTRY_RELEASE: sentryRelease,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
