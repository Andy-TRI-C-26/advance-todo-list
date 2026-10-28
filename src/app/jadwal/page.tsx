import type { Metadata } from 'next';
import { CourseListPage } from "@/modules/courses";

export const metadata: Metadata = {
  title: "Jadwal"
};

export default function Page() {
  return <CourseListPage />;
}
