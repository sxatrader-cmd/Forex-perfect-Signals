import { HomeView } from "@/components/home-view";
import { SiteShell } from "@/components/site-shell";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("ar", "home");

export default function RootHome() {
  return (
    <SiteShell lang="ar">
      <HomeView />
    </SiteShell>
  );
}
