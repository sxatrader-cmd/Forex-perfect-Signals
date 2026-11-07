import type { Metadata } from "next";
import { MethodView } from "@/components/method-view";

export const metadata: Metadata = {
  title: "المنهج",
  description: "قواعد إشارة Forex Perfect Signal: المتوسطات، RSI، MACD، ATR، والتقويم.",
};

export default function MethodPage() {
  return <MethodView />;
}
