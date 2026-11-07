import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Syne } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { I18nProvider } from "@/lib/i18n";
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
  title: {
    default: "Forex Perfect Signal",
    template: "%s | Forex Perfect Signal",
  },
  description:
    "تحليل تعليمي آلي لأزواج العملات من سيف التميمي، وسيط معرّف لدى IC Markets. Automated educational forex studies. Not financial advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${ibm.variable} ${syne.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="fps-lang" strategy="beforeInteractive">
          {`(function(){try{var l=localStorage.getItem("fps-lang");if(l==="en"){document.documentElement.lang="en";document.documentElement.dir="ltr";}else{document.documentElement.lang="ar";document.documentElement.dir="rtl";}}catch(e){}})();`}
        </Script>
        <I18nProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            تخطَّ إلى المحتوى / Skip to content
          </a>
          <SiteHeader />
          <main id="content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
