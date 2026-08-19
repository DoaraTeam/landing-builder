import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { RadixPointerEventsGuard } from "@/components/radix-pointer-events-guard";
import { SITE_URL } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  // Required for relative canonical/OG URLs (e.g. SEOConfig.alternates.canonical
  // stored as "/pricing") to resolve into absolute URLs — without this, Next
  // can't turn a relative canonical into a valid <link rel="canonical"> tag.
  metadataBase: new URL(SITE_URL),
  title: "Landing Page Builder",
  description: "Create stunning landing pages with ease using our intuitive builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster />
        <RadixPointerEventsGuard />
      </body>
    </html>
  );
}
