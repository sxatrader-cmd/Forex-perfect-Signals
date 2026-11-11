import { ArchiveView } from "@/components/archive-view";
import { pageMeta } from "@/lib/seo";
import type { Lang } from "@/lib/langs";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return params.then(({ lang }) => pageMeta(lang as Lang, "archive", "/archive"));
}

export default function ArchivePage() {
  return <ArchiveView />;
}
