import type { Course } from "@/modules/courses";
import type { Settings } from "@/modules/settings";
import type { Task } from "@/modules/tasks";
import type { RecommendationPayload } from "./types";

/**
 * Susun data untuk AI dari data aplikasi.
 * Fungsi murni: hanya mengubah bentuk data, tidak ada efek samping.
 */
export function buildPayload(args: {
  selected: Task;
  activeTasks: Task[];
  courses: Course[];
  settings: Settings;
}): RecommendationPayload {
  const { selected, activeTasks, courses, settings } = args;

  return {
    selectedTask: {
      title: selected.title,
      course: courses.find((c) => c.id === selected.courseId)?.name ?? "Umum",
      deadline: selected.deadline,
      hours: selected.hours,
    },
    otherTasks: activeTasks
      .filter((t) => t.id !== selected.id)
      .map((t) => ({
        title: t.title,
        deadline: t.deadline,
        hours: t.hours,
        completed: t.completed,
      })),
    courses: courses.map((c) => ({
      name: c.name,
      day: c.day,
      start: c.start,
      end: c.end,
    })),
    constraints: {
      sleepStart: settings.sleepStart,
      sleepEnd: settings.sleepEnd,
      operatingStart: "05:00",
      operatingEnd: "22:00",
    },
  };
}
