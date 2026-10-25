"use client";
import { useEffect, type ReactNode } from "react";
import { usePersistentState } from "@/shared/hooks/use-persistent-state";
import { STORAGE_KEYS } from "@/shared/lib/storage-keys";
import { onCourseDeleted } from "@/modules/courses";
import { DeadlineReminder } from "./components/deadline-reminder";
import { TasksContext, type TasksContextValue } from "./tasks-context";
import type { Task } from "./types";

const normalize = (stored: unknown): Task[] | undefined =>
  Array.isArray(stored) ? (stored as Task[]) : undefined;

/** Ganti item dengan id yang sama, atau tambahkan jika belum ada. */
const upsert = (list: Task[], item: Task) =>
  list.some((t) => t.id === item.id)
    ? list.map((t) => (t.id === item.id ? item : t))
    : [...list, item];

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks, ready] = usePersistentState<Task[]>(
    STORAGE_KEYS.tasks,
    [],
    normalize,
  );

  // Reaksi terhadap modul `courses`: kalau mata kuliah dihapus,
  // tugasnya tidak ikut hilang, hanya dilepas dari mata kuliah itu.
  useEffect(
    () =>
      onCourseDeleted(({ courseId }) =>
        setTasks((list) =>
          list.map((t) =>
            t.courseId === courseId ? { ...t, courseId: "" } : t,
          ),
        ),
      ),
    [setTasks],
  );

  const value: TasksContextValue = {
    ready,
    tasks,
    saveTask: (task) => setTasks((list) => upsert(list, task)),
    toggleTask: (id) =>
      setTasks((list) =>
        list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      ),
    deleteTask: (id) => setTasks((list) => list.filter((t) => t.id !== id)),
    clearTasks: () => setTasks([]),
    replaceTasks: setTasks,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
      <DeadlineReminder />
    </TasksContext.Provider>
  );
}
