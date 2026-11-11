import { NewsView } from "@/components/news-view";
import { pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "news", "/news"));
}

export default function NewsPage() {
  return <NewsView />;
}
