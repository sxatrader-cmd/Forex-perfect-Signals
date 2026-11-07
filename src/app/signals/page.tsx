import type { Metadata } from "next";
import { SignalsView } from "@/components/signals-view";

export const metadata: Metadata = {
  title: "الإشارات",
  description: "الإشارات المفتوحة وسجل الإغلاق ومراجعة الأزواج السبعة. Educational forex signals with six measured reasons.",
};

export default function SignalsPage() {
  return <SignalsView />;
}
