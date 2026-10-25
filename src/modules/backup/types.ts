import type { Course } from "@/modules/courses";
import type { Settings } from "@/modules/settings";
import type { Task } from "@/modules/tasks";

/**
 * Bentuk file backup. Sama persis dengan format versi lama aplikasi,
 * jadi backup lama di Google Drive tetap bisa dipulihkan.
 */
export type BackupData = {
  tasks: Task[];
  courses: Course[];
  settings: Settings;
};
