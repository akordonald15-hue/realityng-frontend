import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";
import { SITE_URL } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RealityNG | Nigerian Property Discovery",
    template: "%s | RealityNG",
  },
  description:
    "Where dreams find an address. Find, verify, buy, rent, build, and manage properties in Nigeria.",
  applicationName: "RealityNG",
  keywords: [
    "Nigeria property",
    "Nigerian real estate",
    "Lagos apartments",
    "Abuja property",
    "property verification Nigeria",
    "diaspora property Nigeria",
    "shortlets Nigeria",
    "land for sale Nigeria",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icons/realityng-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/realityng-icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "RealityNG",
    title: "RealityNG | Nigerian Property Discovery",
    description:
      "Where dreams find an address. Discover verified Nigerian property listings with RealityNG.",
    images: [{ url: "/brand/realityng-social.png", width: 1200, height: 630, alt: "RealityNG" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RealityNG",
    description:
      "Where dreams find an address. Discover verified Nigerian property listings with RealityNG.",
    images: ["/brand/realityng-social.png"],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`} lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
