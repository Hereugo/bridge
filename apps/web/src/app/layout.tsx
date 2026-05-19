import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import { Providers } from "./providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bridge",
  description: "Meet interesting people — warm introductions, real connections.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bridge",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1419",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="font-sans min-h-screen">
        <Providers>
          <RegisterSW />
          <main className="mx-auto min-h-screen max-w-lg px-4 py-8 md:max-w-xl lg:max-w-2xl">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
