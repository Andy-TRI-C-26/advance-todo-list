import type { Metadata } from 'next';
import { RecommendationPage } from "@/modules/recommendation";

export const metadata: Metadata = {
  title: "Rekomendasi AI"
};

export default function Page() {
  return <RecommendationPage />;
}
