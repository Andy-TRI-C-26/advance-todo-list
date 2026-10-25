"use client";
import { createContext, useContext, type ReactNode } from "react";
import { usePersistentState } from "@/shared/hooks/use-persistent-state";
import { STORAGE_KEYS } from "@/shared/lib/storage-keys";
import { emitCourseDeleted } from "./course-events";
import type { Course } from "./types";

const normalize = (stored: unknown): Course[] | undefined =>
  Array.isArray(stored) ? (stored as Course[]) : undefined;

/** Ganti item dengan id yang sama, atau tambahkan jika belum ada. */
const upsert = (list: Course[], item: Course) =>
  list.some((c) => c.id === item.id)
    ? list.map((c) => (c.id === item.id ? item : c))
    : [...list, item];

type CoursesContextValue = {
  ready: boolean;
  courses: Course[];
  saveCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  clearCourses: () => void;
  replaceCourses: (courses: Course[]) => void;
};

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses harus di dalam <CoursesProvider>");
  return ctx;
}

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses, ready] = usePersistentState<Course[]>(
    STORAGE_KEYS.courses,
    [],
    normalize,
  );

  const value: CoursesContextValue = {
    ready,
    courses,
    saveCourse: (course) => setCourses((list) => upsert(list, course)),
    deleteCourse: (id) => {
      setCourses((list) => list.filter((c) => c.id !== id));
      // Beri tahu modul lain (modul `tasks` akan melepas tugas dari kuliah ini)
      emitCourseDeleted({ courseId: id });
    },
    clearCourses: () => setCourses([]),
    replaceCourses: setCourses,
  };

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}
