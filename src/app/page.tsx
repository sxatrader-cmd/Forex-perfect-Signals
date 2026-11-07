import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";

export const metadata: Metadata = {
  title: "Forex Perfect Signal",
  description:
    "إشارات تعليمية يومية لأزواج العملات الرئيسية من سيف التميمي، وسيط معرّف لدى IC Markets. Educational daily studies of the major pairs.",
};

export default function HomePage() {
  return <HomeView />;
}
