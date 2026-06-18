import type { Metadata } from "next";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "RealityNG",
  description: "Find, verify, buy, rent, build, and manage properties in Nigeria.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
