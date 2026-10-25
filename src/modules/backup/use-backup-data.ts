"use client";
import { useCourses } from "@/modules/courses";
import { useSettings } from "@/modules/settings";
import { useTasks } from "@/modules/tasks";
import type { BackupData } from "./types";

/**
 * Pintu satu-satunya modul `backup` ke data modul lain.
 * Ia hanya memakai API publik (useTasks, useCourses, useSettings).
 */
export function useBackupData() {
  const { tasks, replaceTasks, clearTasks } = useTasks();
  const { courses, replaceCourses, clearCourses } = useCourses();
  const { settings, replaceSettings } = useSettings();

  /** Seluruh data aplikasi, siap di-backup. */
  const snapshot: BackupData = { tasks, courses, settings };

  /** Timpa seluruh data dengan isi backup. */
  function restore(data: BackupData) {
    if (!Array.isArray(data?.tasks) || !Array.isArray(data?.courses))
      throw new Error("File backup tidak valid.");
    replaceTasks(data.tasks);
    replaceCourses(data.courses);
    if (data.settings) replaceSettings(data.settings);
  }

  /** Hapus semua tugas dan jadwal kuliah (pengaturan tetap). */
  function clearAll() {
    clearTasks();
    clearCourses();
  }

  return { snapshot, restore, clearAll };
}
