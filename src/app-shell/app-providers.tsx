"use client";
import type { ReactNode } from "react";
import { NowProvider } from "@/shared/hooks/use-now";
import { CoursesProvider } from "@/modules/courses";
import { NotificationsProvider } from "@/modules/notifications";
import { SchedulingProvider } from "@/modules/scheduling";
import { SettingsProvider } from "@/modules/settings";
import { TasksProvider } from "@/modules/tasks";
import { migrateLegacyStorage } from "./migrate-legacy-storage";

// Jalankan SEKALI saat file ini dimuat di browser, sebelum provider membaca localStorage.
if (typeof window !== "undefined") migrateLegacyStorage();

/**
 * Semua provider dipasang di sini, dari yang paling dasar ke yang paling atas.
 * Aturannya: provider hanya boleh memakai provider yang ada DI LUARNYA.
 * Contoh: TasksProvider memakai notifications & courses, jadi harus di dalam keduanya.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NowProvider>
      <NotificationsProvider>
        <SettingsProvider>
          <CoursesProvider>
            <TasksProvider>
              <SchedulingProvider>{children}</SchedulingProvider>
            </TasksProvider>
          </CoursesProvider>
        </SettingsProvider>
      </NotificationsProvider>
    </NowProvider>
  );
}
