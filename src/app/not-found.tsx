"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLang, LANG_META, type Lang } from "@/lib/langs";
import { dict } from "@/lib/locales";

/** One static 404.html serves every locale. The heading follows the URL's language after hydration. */
export default function NotFound() {
  const [lang, setLang] = useState<Lang>("ar");
  useEffect(() => {
    const segment = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
    if (isLang(segment)) setLang(segment);
  }, []);
  const copy = dict(lang);
  const meta = LANG_META[lang];
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col gap-3 px-4 py-20" lang={meta.tag} dir={meta.dir}>
      <h1 className="text-3xl font-semibold">{copy.notFoundTitle}</h1>
      <Link href={`/${lang}/`} className="text-primary">
        {copy.backHome}
      </Link>
    </div>
  );
}
