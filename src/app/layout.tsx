import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

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
  title: "RealityNG",
  description: "Find, verify, buy, rent, build, and manage properties in Nigeria.",
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
