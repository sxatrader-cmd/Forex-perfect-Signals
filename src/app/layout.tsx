import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Syne } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "توصيات فوركس مجانية من العراق. Educational forex signals from 964FX. Not financial advice.",
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo-mark.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibm.variable} ${syne.variable} dark h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://secure.ic.com" />
        <link rel="preconnect" href="https://promo.icmarkets.com" />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          تخطَّ إلى المحتوى / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
