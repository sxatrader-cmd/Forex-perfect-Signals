import { HomeView } from "@/components/home-view";
import { pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "home"));
}

export default function LangHome() {
  return <HomeView />;
}
