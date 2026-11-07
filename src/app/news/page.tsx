import type { Metadata } from "next";
import { NewsView } from "@/components/news-view";

export const metadata: Metadata = {
  title: "الأخبار",
  description: "تقويم Forex Factory لهذا الأسبوع بتوقيت بغداد وبتوقيت الزائر، مع الفعلي عند صدوره.",
};

export default function NewsPage() {
  return <NewsView />;
}
