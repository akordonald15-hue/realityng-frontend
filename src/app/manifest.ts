import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RealityNG",
    short_name: "RealityNG",
    description:
      "Where dreams find an address. Find, verify, buy, rent, build, and manage properties in Nigeria.",
    start_url: "/",
    display: "standalone",
    background_color: "#06271F",
    theme_color: "#0B3B2E",
    icons: [
      {
        src: "/icons/realityng-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/realityng-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
