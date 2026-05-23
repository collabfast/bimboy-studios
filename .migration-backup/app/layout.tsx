import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BimBoy Studios",
    template: "%s | BimBoy Studios",
  },
  description:
    "Premium creator and studio platform scaffold for BimBoy Studios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <div className="site-backdrop" />
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 pb-16">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
