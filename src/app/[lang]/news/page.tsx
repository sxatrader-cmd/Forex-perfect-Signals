import type { Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";
import { seoCopy } from "@/lib/seo-copy";
import { BASE_PATH, SITE_URL } from "@/lib/site";

/** Static export cannot 301. This URL stays reachable and points search engines at the calendar. */
export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => {
    const code = lang as Lang;
    const seo = seoCopy(code)?.calendar;
    const fallback = dict(code).seo.calendar;
    return {
      title: { absolute: seo?.title ?? fallback.title },
      description: seo?.description ?? fallback.description,
      alternates: { canonical: `${SITE_URL}/${code}/calendar/` },
      robots: { index: false, follow: true },
    };
  });
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const code = lang as Lang;
  const d = dict(code);
  const dest = `${BASE_PATH}/${code}/calendar/`;
  const heading = seoCopy(code)?.calendar.h1 ?? d.nav.news;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${dest}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(dest)})`,
        }}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-4 text-sm leading-7">
          <a href={dest} className="text-primary underline-offset-4 hover:underline">
            {d.nav.news}
          </a>
        </p>
      </div>
    </>
  );
}
