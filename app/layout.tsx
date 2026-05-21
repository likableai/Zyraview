import React from "react";
import "./globals.css";
import GlobalFooter from "@/components/GlobalFooter";
import { PageMetadataProvider } from "@/context/pagemetadataContext";
import { LanguageProvider } from '@/context/languagecontext';
import { PiNetworkProvider } from '@/context/PiNetworkContext';
import GlobalMobileElements from "@/components/GlobalMobileElements";
import { ThemeProvider } from "@/components/theme-provider";
import NavbarWithMobile from '@/components/navbar';
import { AddressProvider } from '@/context/AddressContext';
import Script from 'next/script';
import type { Metadata, Viewport } from "next";
import MobilePiWelcome from "@/components/MobilePiWelcome";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000'),
  title: {
    default: 'Zyrachain',
    template: '%s | Zyrachain'
  },
  description: 'Zyrachain is a data-driven platform for Pi Network enthusiasts, offering resources, events, and a vibrant ecosystem to connect and grow together.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
      <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
      <Script id="pi-init" strategy="beforeInteractive">
        {`
          const Pi = window.Pi;
          Pi.init({ version: "2.0" });
        `}
      </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PiNetworkProvider>
            <AddressProvider>
              <LanguageProvider>
                <PageMetadataProvider>
                  <MobilePiWelcome />
                    <NavbarWithMobile />
                    <GlobalMobileElements />
                    <div className="flex min-h-screen flex-col">
                      <main className="flex-1 pb-safe-area-mobile lg:pb-0">
                        {children}
                      </main>
                      <GlobalFooter />
                    </div>
                </PageMetadataProvider>
              </LanguageProvider>
            </AddressProvider>
          </PiNetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
