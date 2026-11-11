import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Noto_Sans_Devanagari, Noto_Sans_Tamil, Syne, Vazirmatn } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { siteVerification } from "@/lib/seo";
import "./globals.css";

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm",
  display: "swap",
});

// Script fonts below are only downloaded by pages whose text needs them (unicode-range), so no preload.
const plex = IBM_Plex_Sans({
  subsets: ["cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
  preload: false,
});

const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-deva",
  display: "swap",
  preload: false,
});

const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
  preload: false,
});

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
  preload: false,
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
  verification: siteVerification(),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibm.variable} ${syne.variable} ${plex.variable} ${deva.variable} ${tamil.variable} ${vazir.variable} dark h-full antialiased`}>
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
