"use client";
import { createContext, useContext } from "react";
import type { Task } from "./types";

// Context dan hook dipisah dari provider supaya komponen lain di modul ini
// (mis. DeadlineReminder) bisa memakai useTasks tanpa saling-impor dengan provider.

export type TasksContextValue = {
  ready: boolean;
  tasks: Task[];
  saveTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearTasks: () => void;
  replaceTasks: (tasks: Task[]) => void;
};

export const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks harus di dalam <TasksProvider>");
  return ctx;
}
