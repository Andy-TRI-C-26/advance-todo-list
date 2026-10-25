"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useNow } from "@/shared/hooks/use-now";
import { useCourses } from "@/modules/courses";
import { useSettings } from "@/modules/settings";
import { useTasks } from "@/modules/tasks";
import { useToast } from "@/modules/notifications";
import { schedule } from "./schedule";
import type { SchedulePlan } from "./types";

// Modul ini adalah "perekat": mengambil data dari tasks, courses, dan settings,
// lalu menghitung rencana (plan) yang bisa dipakai halaman mana pun.

const PlanContext = createContext<SchedulePlan | null>(null);

export function usePlan() {
  const plan = useContext(PlanContext);
  if (!plan) throw new Error("usePlan harus di dalam <SchedulingProvider>");
  return plan;
}

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const { tasks } = useTasks();
  const { courses } = useCourses();
  const { settings } = useSettings();
  const now = useNow();
  const toast = useToast();

  const plan = useMemo(
    () =>
      schedule({
        tasks,
        courses,
        sleepStart: settings.sleepStart,
        sleepEnd: settings.sleepEnd,
        now,
      }),
    [tasks, courses, settings.sleepStart, settings.sleepEnd, now],
  );

  // Peringatkan sekali setiap kali kumpulan tugas yang kekurangan waktu berubah
  const shortTaskIds = Object.keys(plan.shortfall).join();
  useEffect(() => {
    if (shortTaskIds)
      toast(
        "Waktu luang terbatas! Prinsipnya: yang penting selesai daripada bagus.",
        "warn",
      );
  }, [shortTaskIds, toast]);

  return <PlanContext.Provider value={plan}>{children}</PlanContext.Provider>;
}
